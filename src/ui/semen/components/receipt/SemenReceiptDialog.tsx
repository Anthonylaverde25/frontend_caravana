import React, { forwardRef, useMemo, useState } from 'react';
import { Alert, Box, Dialog, Paper, Slide, Stack, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useSnackbar } from 'notistack';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useRegisterSemenReceipt, useSemenInventory, useSemenSires } from '@/features/semen/hooks/useSemen';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { defaultWarehouse } from '@/core/stock/domain/rules/warehouseRules';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { straws } from '@/core/semen/domain/rules/semenLabels';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import { buildReceiptPayload, emptyReceiptLine, receiptTotals, SemenReceiptHeader, SemenReceiptLine, withTrailingReceipt } from './receiptState';
import SemenReceiptHeaderFields from './SemenReceiptHeaderFields';
import SemenReceiptLineRow from './SemenReceiptLineRow';
import SemenSireDialog from '../sire/SemenSireDialog';

const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const today = (): string => new Date().toISOString().slice(0, 10);
type Errors = { header: Record<string, string>; cells: Record<string, Record<string, string>> };

/**
 * "Ingresar semen" (S14, plan 5.5): straws into one tank, several sires, types and lots in one load
 * (P11), with no provider document behind. A row without lot is allowed and opens the "Identificar
 * partida" notice (SL6). The backend answers every rule on click, by cell.
 */
export default function SemenReceiptDialog({ onClose }: { onClose: () => void }) {
	const { headSx, indexSx } = useGridCellStyles();
	const { enqueueSnackbar } = useSnackbar();
	const { data: warehouses = [] } = useWarehouses();
	const { data: sires = [] } = useSemenSires();
	const { data: inventory = [] } = useSemenInventory({ includeInactive: true });
	const { mutateAsync, isPending } = useRegisterSemenReceipt();
	const [key, renewKey] = useIdempotencyKey();
	const tanks = warehouses.filter((w) => w.kind === 'CRYO_TANK' && w.isActive);
	const [header, setHeader] = useState<SemenReceiptHeader>({ occurredAt: today(), warehouseId: null, providerId: null, notes: '' });
	const [lines, setLines] = useState<SemenReceiptLine[]>(() => withTrailingReceipt([emptyReceiptLine()]));
	const [errors, setErrors] = useState<Errors>({ header: {}, cells: {} });
	const [sireForRow, setSireForRow] = useState<string | null>(null);
	const warehouseId = header.warehouseId ?? defaultWarehouse(tanks, 'CRYO_TANK')?.id ?? null;
	const totals = receiptTotals(lines);
	const existingLots = useMemo(() => {
		const map = new Map<string, Set<string>>();
		inventory.forEach((r) => map.set(`${r.sire.id}|${r.semenType.value}`, new Set(r.lots.map((l) => l.code))));
		return map;
	}, [inventory]);

	const patchLine = (lineKey: string, patch: Partial<SemenReceiptLine>) =>
		setLines((current) => withTrailingReceipt(current.map((l) => (l.key === lineKey ? { ...l, ...patch } : l))));

	const submit = async () => {
		const built = buildReceiptPayload({ ...header, warehouseId }, lines, key);
		try {
			const document = await mutateAsync(built.payload);
			renewKey();
			const pending = document.incidentsRaised.some((i) => i.type === 'UNIDENTIFIED_SEMEN_LOT');
			enqueueSnackbar(`Ingreso de semen N.º ${document.number} registrado.${pending ? ' Quedan pajuelas sin partida para identificar.' : ''}`, { variant: pending ? 'warning' : 'success' });
			onClose();
		} catch (error) {
			const { fields, domain } = readApiErrors(error, 'No se pudo registrar el ingreso.');
			const next: Errors = { header: {}, cells: {} };
			Object.entries(fields).forEach(([field, message]) => {
				const match = /^lines\.(\d+)\.(.+)$/.exec(field);
				const rowKey = match ? built.lineKeys[Number(match[1])] : undefined;
				if (rowKey && match) next.cells[rowKey] = { ...next.cells[rowKey], [match[2]]: message };
				else next.header[field] = message;
			});
			setErrors(next);
			enqueueSnackbar(domain ?? 'Revisá los datos marcados en rojo.', { variant: 'error' });
		}
	};

	return (
		<Dialog fullScreen open onClose={onClose} TransitionComponent={SlideUp} PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}>
			<FullScreenEntryBar title="Ingresar semen" subtitle="Pajuelas que llegan a un termo: padre, tipo, partida, cantidad y costo. Sin comprobante."
				primaryLabel={`Registrar ${straws(totals.straws)}`} primaryIcon="heroicons-outline:check" busy={isPending} onClose={onClose} onPrimary={submit} />
			<Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 3 }, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
					<Typography sx={sectionTitleSx}>1. Ingreso</Typography>
					<Box sx={{ mt: 1.5 }}>
						<SemenReceiptHeaderFields header={{ ...header, warehouseId }} tanks={tanks} errors={errors.header} onChange={(patch) => setHeader((h) => ({ ...h, ...patch }))} />
					</Box>
				</Paper>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', minWidth: 0 }}>
					<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>2. Pajuelas</Typography>
					<SheetGrid minWidth={1040} maxHeight={{ xs: 520, lg: 'calc(100vh - 340px)' }}>
						<TableHead>
							<TableRow>
								<TableCell sx={indexSx}>#</TableCell>
								<TableCell sx={headSx}>Padre</TableCell>
								<TableCell sx={{ ...headSx, width: 150 }}>Tipo</TableCell>
								<TableCell sx={{ ...headSx, width: 140 }}>Partida</TableCell>
								<TableCell sx={{ ...headSx, width: 150 }}>Colección</TableCell>
								<TableCell sx={{ ...headSx, width: 100 }}>Pajuelas</TableCell>
								<TableCell sx={{ ...headSx, width: 120 }}>Costo por pajuela</TableCell>
								<TableCell sx={{ ...headSx, width: 130 }} align="right">Importe</TableCell>
								<TableCell sx={{ ...headSx, width: 48 }} />
							</TableRow>
						</TableHead>
						<TableBody>
							{lines.map((line, index) => (
								<SemenReceiptLineRow key={line.key} index={index} line={line} sires={sires} existingLots={existingLots} errors={errors.cells[line.key] ?? {}}
									onChange={(patch) => patchLine(line.key, patch)} onCreateSire={() => setSireForRow(line.key)}
									onRemove={() => setLines((current) => withTrailingReceipt(current.filter((l) => l.key !== line.key)))} />
							))}
						</TableBody>
					</SheetGrid>
					<Stack direction="row" justifyContent="flex-end" spacing={3} sx={{ mt: 1.5, fontSize: '0.85rem' }}>
						<Typography sx={{ fontSize: 'inherit' }}>Total: <b>{straws(totals.straws)}</b></Typography>
						<Typography sx={{ fontSize: 'inherit' }}>Valor: <b>{formatMoney(String(totals.amount))}</b></Typography>
					</Stack>
					{totals.withoutLot > 0 && (
						<Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5, mt: 1.5 }}>
							{totals.withoutLot} renglón(es) sin partida: se registran igual y queda una novedad "Identificar partida" para cargarla después.
						</Alert>
					)}
				</Paper>
			</Box>
			<SemenSireDialog open={sireForRow !== null} onClose={() => setSireForRow(null)} onSaved={(sire) => sireForRow && patchLine(sireForRow, { sireId: sire.id })} />
		</Dialog>
	);
}

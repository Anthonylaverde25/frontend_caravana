import React, { forwardRef, useMemo, useState } from 'react';
import { Alert, Box, Dialog, Paper, Slide, Stack, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useSnackbar } from 'notistack';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useItems } from '@/features/items/hooks/useItems';
import { useRegisterInitialStock } from '@/features/stock/hooks/useItemDocuments';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { ItemDocument } from '@/core/stock/domain/entities/ItemDocument';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import { buildInitialPayload, emptyInitialLine, InitialStockLine, isBlankInitial } from './initialStockState';
import InitialStockLineRow from './InitialStockLineRow';
import WarehouseSelectField from '@/ui/stock/components/cells/WarehouseSelectField';

const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const today = (): string => new Date().toISOString().slice(0, 10);
const trailing = (lines: InitialStockLine[]) => (lines.length === 0 || !isBlankInitial(lines[lines.length - 1]) ? [...lines, emptyInitialLine()] : lines);

/** "Stock inicial": what the company already had when it started, with what it cost (0 if unknown). */
export default function InitialStockEntryDialog({ onClose, onDone }: { onClose: () => void; onDone: (document: ItemDocument) => void }) {
	const { headSx, indexSx } = useGridCellStyles();
	const { enqueueSnackbar } = useSnackbar();
	const { data: items = [] } = useItems({ behavior: 'STOCKED_ARTICLE' });
	const { mutateAsync, isPending } = useRegisterInitialStock();
	const [key, renewKey] = useIdempotencyKey();
	const [warehouseId, setWarehouseId] = useState<number | null>(null);
	const [occurredAt, setOccurredAt] = useState(today);
	const [notes, setNotes] = useState('');
	const [lines, setLines] = useState<InitialStockLine[]>([emptyInitialLine()]);
	const [errors, setErrors] = useState<{ cells: Record<string, Record<string, string>>; header: Record<string, string> }>({ cells: {}, header: {} });
	const filled = useMemo(() => lines.filter((l) => !isBlankInitial(l)), [lines]);

	const submit = async () => {
		const built = buildInitialPayload(lines, warehouseId, occurredAt, notes, key);
		try {
			const document = await mutateAsync(built.payload);
			renewKey();
			enqueueSnackbar(`Stock inicial registrado: movimiento N.º ${document.number}.`, { variant: 'success' });
			onDone(document);
		} catch (error) {
			const { fields, domain } = readApiErrors(error, 'No se pudo registrar el stock inicial.');
			const next = { cells: {} as Record<string, Record<string, string>>, header: {} as Record<string, string> };
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
			<FullScreenEntryBar title="Stock inicial" subtitle="Lo que había en el almacén al empezar a usar el sistema, con su costo. Si no se conoce, 0."
				primaryLabel={`Registrar ${filled.length} renglón(es)`} primaryIcon="heroicons-outline:check" busy={isPending} onClose={onClose} onPrimary={submit} />
			<Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 3 }, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
					<Typography sx={sectionTitleSx}>1. Carga</Typography>
					<Stack spacing={2} sx={{ mt: 1.5 }}>
						<WarehouseSelectField value={warehouseId} onChange={setWarehouseId} error={errors.header.warehouse_id} />
						<TextField label="Fecha" type="date" variant="filled" fullWidth value={occurredAt} InputProps={filledInputProps} InputLabelProps={{ shrink: true }}
							inputProps={{ max: today() }} onChange={(e) => setOccurredAt(e.target.value)} error={!!errors.header.occurred_at} helperText={errors.header.occurred_at} />
						<TextField label="Notas" variant="filled" fullWidth multiline value={notes} InputProps={filledInputProps} onChange={(e) => setNotes(e.target.value)} />
						<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>Sólo artículos con stock. Las compras se cargan con su comprobante.</Alert>
					</Stack>
				</Paper>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', minWidth: 0 }}>
					<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>2. Renglones</Typography>
					<SheetGrid minWidth={900} maxHeight={{ xs: 520, lg: 'calc(100vh - 300px)' }}>
						<TableHead>
							<TableRow>
								<TableCell sx={indexSx}>#</TableCell>
								<TableCell sx={headSx}>Artículo</TableCell>
								<TableCell sx={{ ...headSx, width: 100 }}>Cant.</TableCell>
								<TableCell sx={{ ...headSx, width: 190 }}>Unidad o presentación</TableCell>
								<TableCell sx={{ ...headSx, width: 120 }}>Costo u.</TableCell>
								<TableCell sx={{ ...headSx, width: 130 }} align="right">Importe</TableCell>
								<TableCell sx={{ ...headSx, width: 130 }}>Equivale a</TableCell>
								<TableCell sx={{ ...headSx, width: 48 }} />
							</TableRow>
						</TableHead>
						<TableBody>
							{lines.map((line, index) => (
								<InitialStockLineRow key={line.key} index={index} line={line} items={items.filter((i) => i.isActive)} errors={errors.cells[line.key] ?? {}}
									onChange={(patch) => setLines((current) => trailing(current.map((l) => (l.key === line.key ? { ...l, ...patch } : l))))}
									onRemove={() => setLines((current) => trailing(current.filter((l) => l.key !== line.key)))} />
							))}
						</TableBody>
					</SheetGrid>
				</Paper>
			</Box>
		</Dialog>
	);
}

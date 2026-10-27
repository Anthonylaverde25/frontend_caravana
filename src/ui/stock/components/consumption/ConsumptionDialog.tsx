import { useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useItems } from '@/features/items/hooks/useItems';
import { useOwnActiveBatches } from '@/features/batches/hooks/useOwnActiveBatches';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { useRegisterConsumption } from '@/features/stock/hooks/useStockOperations';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import { buildConsumptionPayload, ConsumptionHeader, ConsumptionLine, emptyConsumptionLine, isBlankConsumption, withTrailingConsumption } from './consumptionState';
import ConsumptionHeaderFields from './ConsumptionHeaderFields';
import ConsumptionLineRow from './ConsumptionLineRow';

interface ConsumptionDialogProps {
	open: boolean;
	onClose: () => void;
	/** From /herd: the batch is loaded and stays fixed (D20). */
	batch?: Batch | null;
}

/** Batches that never receive a consumption: the animals are dead or slaughtered (DS10). */
const EXCLUDED_BATCH_TYPES = ['INTERNAL_DEATH', 'INTERNAL_CONSUMPTION'];
const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * "Registrar consumo" (D20, plan 8.6): the same dialog from Movimientos de stock and from the batch
 * in /herd. Articles leave at the warehouse's average; a balance that goes negative is recorded
 * anyway and opens a notice (D5).
 */
export default function ConsumptionDialog({ open, onClose, batch }: ConsumptionDialogProps) {
	const { headSx, indexSx } = useGridCellStyles();
	const { enqueueSnackbar } = useSnackbar();
	const { data: items = [] } = useItems({ behavior: 'STOCKED_ARTICLE' });
	const { batches } = useOwnActiveBatches();
	const chargeable = useMemo(() => batches.filter((b) => !EXCLUDED_BATCH_TYPES.includes(b.batch_type_code ?? '')), [batches]);
	const { mutateAsync, isPending } = useRegisterConsumption();
	const [key, renewKey] = useIdempotencyKey();
	const [header, setHeader] = useState<ConsumptionHeader>({
		warehouseId: null,
		batchId: batch?.id ?? null,
		batchName: batch?.name ?? null,
		heads: batch?.head_count ? String(batch.head_count) : '',
		occurredAt: today(),
		notes: ''
	});
	const [lines, setLines] = useState<ConsumptionLine[]>([emptyConsumptionLine()]);
	const [errors, setErrors] = useState<{ header: Record<string, string>; cells: Record<string, Record<string, string>>; domain: string | null }>({ header: {}, cells: {}, domain: null });
	const filled = lines.filter((l) => !isBlankConsumption(l)).length;
	const showLot = lines.some((l) => items.find((i) => i.id === l.itemId)?.isSemen);

	const submit = async () => {
		const built = buildConsumptionPayload(header, lines, key);
		try {
			const document = await mutateAsync(built.payload);
			renewKey();
			const negative = document.incidentsRaised.find((i) => i.type === 'NEGATIVE_BALANCE');
			enqueueSnackbar(negative ? `Consumo N.º ${document.number} registrado. ${negative.detail}` : `Consumo N.º ${document.number} registrado.`, {
				variant: negative ? 'warning' : 'success'
			});
			onClose();
		} catch (error) {
			const { fields, domain } = readApiErrors(error, 'No se pudo registrar el consumo.');
			const next = { header: {} as Record<string, string>, cells: {} as Record<string, Record<string, string>>, domain };
			Object.entries(fields).forEach(([field, message]) => {
				const match = /^lines\.(\d+)\.(.+)$/.exec(field);
				const rowKey = match ? built.lineKeys[Number(match[1])] : undefined;
				if (rowKey && match) next.cells[rowKey] = { ...next.cells[rowKey], [match[2]]: message };
				else if (field === 'lines') next.domain = message;
				else next.header[field] = message;
			});
			setErrors(next);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
					Registrar consumo{batch ? ` · ${batch.name}` : ''}
				</Typography>
				<IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
				<ConsumptionHeaderFields header={header} onChange={(patch) => setHeader((h) => ({ ...h, ...patch }))} batches={chargeable} fixedBatch={!!batch} errors={errors.header} />
				<SheetGrid minWidth={760} maxHeight={320}>
					<TableHead>
						<TableRow>
							<TableCell sx={indexSx}>#</TableCell>
							<TableCell sx={headSx}>Artículo</TableCell>
							{showLot && <TableCell sx={{ ...headSx, width: 170 }}>Partida</TableCell>}
							<TableCell sx={{ ...headSx, width: 90 }}>Cant.</TableCell>
							<TableCell sx={{ ...headSx, width: 190 }}>Unidad o presentación</TableCell>
							<TableCell sx={{ ...headSx, width: 110 }}>Equivale a</TableCell>
							<TableCell sx={{ ...headSx, width: 120 }} align="right">Costo estimado</TableCell>
							<TableCell sx={{ ...headSx, width: 48 }} />
						</TableRow>
					</TableHead>
					<TableBody>
						{lines.map((line, index) => (
							<ConsumptionLineRow key={line.key} index={index} line={line} items={items.filter((i) => i.isActive)} errors={errors.cells[line.key] ?? {}} warehouseId={header.warehouseId} showLot={showLot}
								onChange={(patch) => setLines((current) => withTrailingConsumption(current.map((l) => (l.key === line.key ? { ...l, ...patch } : l))))}
								onRemove={() => setLines((current) => withTrailingConsumption(current.filter((l) => l.key !== line.key)))} />
						))}
					</TableBody>
				</SheetGrid>
				<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
					El costo es el promedio del almacén al registrar. Los servicios y artículos sin stock se cargan con su comprobante.
				</Alert>
				{errors.domain && <Alert severity="error">{errors.domain}</Alert>}
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
				<Button onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button variant="contained" onClick={submit} disabled={isPending} startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
					Registrar consumo{filled ? ` (${filled})` : ''}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

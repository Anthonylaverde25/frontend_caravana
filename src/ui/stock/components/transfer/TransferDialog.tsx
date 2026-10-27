import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { useItems } from '@/features/items/hooks/useItems';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { useRegisterTransfer } from '@/features/stock/hooks/useStockOperations';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { activeWarehouses, defaultWarehouse } from '@/core/stock/domain/rules/warehouseRules';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import { buildTransferPayload, emptyTransferLine, isBlankTransfer, TransferHeader, TransferLine, withTrailingTransfer } from './transferState';
import TransferHeaderFields from './TransferHeaderFields';
import TransferLineRow from './TransferLineRow';
import { settingsSectionPath } from '@/ui/settings/config/settingsNavigation';

interface TransferDialogProps {
	onClose: () => void;
	/** Opened from a warehouse's row or an item's card: the origin comes preloaded. */
	fromWarehouseId?: number | null;
	/** Opened from an item's card: its first row comes preloaded. */
	item?: { id: number; unitId: number | null } | null;
}

const today = (): string => new Date().toISOString().slice(0, 10);
type Errors = { header: Record<string, string>; cells: Record<string, Record<string, string>>; domain: string | null };

/**
 * "Transferir" (DD7): stock-tracked articles from one active warehouse to another, at the origin's
 * average. Only valued units move and the origin never goes below zero (DD8): the backend checks it
 * with the balances locked and answers per cell, on click.
 */
export default function TransferDialog({ onClose, fromWarehouseId, item }: TransferDialogProps) {
	const navigate = useNavigate();
	const { headSx, indexSx } = useGridCellStyles();
	const { enqueueSnackbar } = useSnackbar();
	const { data: warehouses = [] } = useWarehouses();
	const { data: items = [] } = useItems({ behavior: 'STOCKED_ARTICLE' });
	const { mutateAsync, isPending } = useRegisterTransfer();
	const [key, renewKey] = useIdempotencyKey();
	const [header, setHeader] = useState<TransferHeader>({ fromWarehouseId: fromWarehouseId ?? null, toWarehouseId: null, occurredAt: today(), notes: '' });
	const [lines, setLines] = useState<TransferLine[]>(() => withTrailingTransfer([emptyTransferLine(item?.id ?? null, item?.unitId ? `u:${item.unitId}` : '')]));
	const [errors, setErrors] = useState<Errors>({ header: {}, cells: {}, domain: null });
	const from = header.fromWarehouseId ?? defaultWarehouse(warehouses)?.id ?? null;
	const filled = lines.filter((l) => !isBlankTransfer(l)).length;
	const enough = activeWarehouses(warehouses).length > 1;
	const showLot = lines.some((l) => items.find((i) => i.id === l.itemId)?.isSemen);

	const submit = async () => {
		const built = buildTransferPayload({ ...header, fromWarehouseId: from }, lines, key);
		try {
			const document = await mutateAsync(built.payload);
			renewKey();
			enqueueSnackbar(`Transferencia N.º ${document.number} registrada: ${document.warehouse.code} → ${document.paired?.warehouse.code ?? ''}.`, { variant: 'success' });
			onClose();
		} catch (error) {
			const { fields, domain } = readApiErrors(error, 'No se pudo registrar la transferencia.');
			const next: Errors = { header: {}, cells: {}, domain };
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
		<Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Transferir entre almacenes</Typography>
				<IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
				{!enough ? (
					<Alert severity="info" action={<Button size="small" onClick={() => navigate(`${settingsSectionPath('warehouses')}&new=1`)} sx={{ textTransform: 'none', fontWeight: 700 }}>Nuevo almacén</Button>}>
						Necesitás al menos dos almacenes activos para transferir.
					</Alert>
				) : (
					<>
						<TransferHeaderFields header={{ ...header, fromWarehouseId: from }} onChange={(patch) => setHeader((h) => ({ ...h, ...patch }))} errors={errors.header} />
						<SheetGrid minWidth={820} maxHeight={320}>
							<TableHead>
								<TableRow>
									<TableCell sx={indexSx}>#</TableCell>
									<TableCell sx={headSx}>Artículo</TableCell>
									{showLot && <TableCell sx={{ ...headSx, width: 170 }}>Partida</TableCell>}
									<TableCell sx={{ ...headSx, width: 90 }}>Cant.</TableCell>
									<TableCell sx={{ ...headSx, width: 190 }}>Unidad o presentación</TableCell>
									<TableCell sx={{ ...headSx, width: 110 }}>Equivale a</TableCell>
									<TableCell sx={{ ...headSx, width: 150 }}>Disponible</TableCell>
									<TableCell sx={{ ...headSx, width: 120 }} align="right">Costo estimado</TableCell>
									<TableCell sx={{ ...headSx, width: 48 }} />
								</TableRow>
							</TableHead>
							<TableBody>
								{lines.map((line, index) => (
									<TransferLineRow key={line.key} index={index} line={line} items={items.filter((i) => i.isActive)} fromWarehouseId={from} showLot={showLot} errors={errors.cells[line.key] ?? {}}
										onChange={(patch) => setLines((current) => withTrailingTransfer(current.map((l) => (l.key === line.key ? { ...l, ...patch } : l))))}
										onRemove={() => setLines((current) => withTrailingTransfer(current.filter((l) => l.key !== line.key)))} />
								))}
							</TableBody>
						</SheetGrid>
						<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
							Sale al costo promedio del origen y entra al destino a ese mismo costo. Lo pendiente de valorizar queda en el origen hasta que llegue su factura.
						</Alert>
						{errors.domain && <Alert severity="error">{errors.domain}</Alert>}
					</>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
				<Button onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>Cancelar</Button>
				{enough && (
					<Button variant="contained" onClick={submit} disabled={isPending} startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
						sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
						Transferir{filled ? ` (${filled})` : ''}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}

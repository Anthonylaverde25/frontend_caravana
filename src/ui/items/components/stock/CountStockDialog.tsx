import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { WarehouseStock } from '@/core/stock/domain/entities/ItemStock';
import { dec, isZero, mul, round, sub, toApi, ZERO } from '@/core/stock/domain/rules/decimal';
import { convertPreview, inputSourcePayload } from '@/core/stock/domain/rules/lineConversion';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { useInvalidateStock } from '@/features/stock/hooks/useInvalidateStock';
import { useRegisterStockCount } from '@/features/stock/hooks/useStockOperations';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import { useItemInputOptions } from '@/ui/stock/components/cells/useItemInputOptions';

interface CountStockDialogProps {
	item: ItemDetail;
	stock: WarehouseStock;
	onClose: () => void;
}

const filled = { disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } } as const;
const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * "Contar" (D18): what was counted of one item in one warehouse, in its unit or a presentation. It is
 * confirmed against the balance shown here; if a movement changed it meanwhile, the backend answers
 * 409 and the new balance is shown to confirm again (DS6).
 */
export default function CountStockDialog({ item, stock, onClose }: CountStockDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { options } = useItemInputOptions(item.id);
	const { mutateAsync, isPending } = useRegisterStockCount();
	const [key, renewKey] = useIdempotencyKey();
	const invalidate = useInvalidateStock();
	const [seen, setSeen] = useState(stock.quantity);
	const [stale, setStale] = useState(false);
	const [counted, setCounted] = useState('');
	const [source, setSource] = useState(item.unit ? `u:${item.unit.id}` : '');
	const [reason, setReason] = useState('');
	const [date, setDate] = useState(today);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const symbol = item.unit?.symbol ?? '';

	const countedInUnit = counted.trim() === '' ? null : convertPreview(counted, options.find((o) => o.value === source));
	const difference = countedInUnit === null ? null : sub(countedInUnit, dec(seen) ?? ZERO);
	const value = difference === null ? null : round(mul(difference, dec(stock.averageUnitCost) ?? ZERO), 2);

	const submit = async () => {
		try {
			await mutateAsync({
				item_id: item.id,
				warehouse_id: stock.warehouse.id,
				system_quantity_seen: seen,
				counted_quantity: toApi(dec(counted) ?? ZERO, 4),
				...inputSourcePayload(source),
				reason: reason.trim() || null,
				occurred_at: date,
				idempotency_key: key
			});
			renewKey();
			enqueueSnackbar(difference && !isZero(difference) ? 'Conteo registrado con su ajuste y su novedad.' : 'Conteo registrado: coincide con el sistema.', { variant: 'success' });
			onClose();
		} catch (error) {
			const response = (error as { response?: { status?: number; data?: { current_quantity?: string } } }).response;
			if (response?.status === 409 && response.data?.current_quantity) {
				setSeen(response.data.current_quantity);
				setStale(true);
				// The card behind still shows the old balance.
				invalidate();
				return;
			}
			const { fields, domain } = readApiErrors(error, 'No se pudo registrar el conteo.');
			setErrors({ ...fields, ...(domain ? { domain } : {}) });
		}
	};

	return (
		<Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
					Contar {item.name}
				</Typography>
				<IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent>
				<Stack spacing={2} sx={{ pt: 1 }}>
					<Typography variant="body2">
						{stock.warehouse.name} · el sistema tiene <strong>{formatQuantity(seen, symbol)}</strong>
					</Typography>
					{stale && (
						<Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
							El saldo cambió mientras contabas (se registró otro movimiento). Revisá lo contado y confirmá de nuevo.
						</Alert>
					)}
					<Stack direction="row" spacing={1.5}>
						<TextField label="Contado" variant="filled" fullWidth value={counted} InputProps={filled} inputProps={{ inputMode: 'decimal' }} autoFocus
							onChange={(e) => setCounted(e.target.value)} error={!!errors.counted_quantity} helperText={errors.counted_quantity} />
						<TextField select label="Unidad o presentación" variant="filled" fullWidth value={options.some((o) => o.value === source) ? source : ''} InputProps={filled}
							onChange={(e) => setSource(e.target.value)} error={!!(errors.input_unit_id ?? errors.input_presentation_id)}>
							{options.map((o) => (
								<MenuItem key={o.value} value={o.value}>
									{o.label}
								</MenuItem>
							))}
						</TextField>
					</Stack>
					{difference !== null && (
						<Typography variant="body2" color={isZero(difference) ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700 }}>
							{isZero(difference) ? 'Sin diferencia: coincide con el sistema.' : `Diferencia ${formatQuantity(difference, symbol)} (${formatMoney(value)} al promedio)`}
						</Typography>
					)}
					<TextField label="Motivo" variant="filled" fullWidth value={reason} InputProps={filled} placeholder="Obligatorio si hay diferencia"
						onChange={(e) => setReason(e.target.value)} error={!!errors.reason} helperText={errors.reason} />
					<TextField label="Fecha" type="date" variant="filled" fullWidth value={date} InputProps={filled} InputLabelProps={{ shrink: true }}
						inputProps={{ max: today() }} onChange={(e) => setDate(e.target.value)} />
					{errors.domain && <Alert severity="error">{errors.domain}</Alert>}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
				<Button onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button variant="contained" onClick={submit} disabled={isPending} startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
					Registrar conteo
				</Button>
			</DialogActions>
		</Dialog>
	);
}

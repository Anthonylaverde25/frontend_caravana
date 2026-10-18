import { useEffect, useState } from 'react';
import { Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { WarehouseStock } from '@/core/stock/domain/entities/ItemStock';
import { dec, isNegative, toApi } from '@/core/stock/domain/rules/decimal';
import { formatMoney, formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';
import { useSetCriticalStock } from '@/features/stock/hooks/useItemStock';
import { readApiErrors } from '@/ui/items/components/apiErrors';

interface WarehouseStockCardProps {
	itemId: number;
	stock: WarehouseStock;
	unitSymbol: string | null;
}

const Figure = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
	<Stack spacing={0.25}>
		<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
			{label}
		</Typography>
		<Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: tone, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
	</Stack>
);

/** An item's balance in one warehouse, its average and value, and its critical level (D19). */
export default function WarehouseStockCard({ itemId, stock, unitSymbol }: WarehouseStockCardProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutateAsync, isPending } = useSetCriticalStock();
	const [level, setLevel] = useState(stock.criticalStock ? formatQuantity(stock.criticalStock) : '');
	const [error, setError] = useState<string | null>(null);
	useEffect(() => setLevel(stock.criticalStock ? formatQuantity(stock.criticalStock) : ''), [stock.criticalStock]);
	const quantity = dec(stock.quantity);

	const save = async () => {
		const parsed = dec(level);
		if (level.trim() !== '' && (parsed === null || isNegative(parsed))) {
			setError('Un número mayor o igual a cero, o vacío para no controlar.');
			return;
		}
		try {
			await mutateAsync({ itemId, warehouseId: stock.warehouse.id, level: parsed === null ? null : toApi(parsed, 4) });
			setError(null);
			enqueueSnackbar(parsed === null ? 'Sin control de stock crítico.' : 'Nivel crítico guardado.', { variant: 'success' });
		} catch (e) {
			setError(readApiErrors(e).fields.critical_stock ?? readApiErrors(e).domain);
		}
	};

	return (
		<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
			<Typography sx={{ fontWeight: 700, mb: 1.5 }}>{stock.warehouse.name}</Typography>
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 2 }}>
				<Figure label="Saldo" value={formatQuantity(stock.quantity, unitSymbol)} tone={quantity !== null && isNegative(quantity) ? 'error.main' : undefined} />
				<Figure label={`Costo promedio${unitSymbol ? ` por ${unitSymbol}` : ''}`} value={formatUnitCost(stock.averageUnitCost)} />
				<Figure label="Valorizado" value={formatMoney(stock.value)} />
			</Stack>
			<Stack direction="row" spacing={1.5} alignItems="flex-start">
				<TextField label="Nivel crítico" variant="filled" size="small" value={level} onChange={(e) => setLevel(e.target.value)} sx={{ width: 220 }}
					InputProps={{ disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' }, endAdornment: <InputAdornment position="end">{unitSymbol}</InputAdornment> }}
					error={!!error} helperText={error ?? (stock.isBelowCritical ? 'El saldo está en el nivel crítico o por debajo.' : 'Vacío = sin control.')} />
				<Button onClick={save} disabled={isPending} sx={{ mt: 0.75, textTransform: 'none', fontWeight: 600 }}>
					Guardar
				</Button>
			</Stack>
		</Paper>
	);
}

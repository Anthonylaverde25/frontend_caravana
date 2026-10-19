import { Stack, Typography } from '@mui/material';
import { WarehouseSummary } from '@/core/stock/domain/entities/ItemStock';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** What a warehouse holds, in plain lines (DD4): the user decides with this in view. */
export default function WarehouseStatusSummary({ summary }: { summary: WarehouseSummary }) {
	const lines = [
		summary.itemsWithBalance > 0 && `${plural(summary.itemsWithBalance, 'artículo con saldo', 'artículos con saldo')} · ${formatMoney(summary.valuedValue)}`,
		summary.itemsWithUnvalued > 0 &&
			`${plural(summary.itemsWithUnvalued, 'artículo', 'artículos')} con unidades pendientes de valorizar (${plural(summary.pendingLots, 'remito', 'remitos')})`,
		summary.negativeItems > 0 && plural(summary.negativeItems, 'artículo en negativo', 'artículos en negativo'),
		summary.openIncidents > 0 && plural(summary.openIncidents, 'novedad abierta', 'novedades abiertas')
	].filter(Boolean) as string[];

	return (
		<Stack spacing={0.5} sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
			{lines.length === 0 ? (
				<Typography sx={{ fontSize: '0.85rem' }}>No tiene saldo ni novedades.</Typography>
			) : (
				lines.map((line) => (
					<Typography key={line} sx={{ fontSize: '0.85rem' }}>
						{line}
					</Typography>
				))
			)}
		</Stack>
	);
}

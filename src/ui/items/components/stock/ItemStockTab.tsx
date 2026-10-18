import { Alert, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useItemStock } from '@/features/stock/hooks/useItemStock';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import WarehouseStockCard from './WarehouseStockCard';

/** The Stock tab: one card per warehouse, and the item's open stock notices. */
export default function ItemStockTab({ item }: { item: ItemDetail }) {
	const { data, isLoading } = useItemStock(item.id);

	if (isLoading || !data) {
		return <CircularProgress size={24} />;
	}

	return (
		<Stack spacing={2} sx={{ maxWidth: 960 }}>
			{data.warehouses.length === 0 ? (
				<Alert severity="info">Todavía no tuvo movimientos. Entra al almacén con un comprobante de compra o con el stock inicial.</Alert>
			) : (
				data.warehouses.map((stock) => <WarehouseStockCard key={stock.warehouse.id} itemId={item.id} stock={stock} unitSymbol={item.unit?.symbol ?? null} />)
			)}
			{data.openIncidents.length > 0 && (
				<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
					<Typography sx={{ fontWeight: 700, mb: 1 }}>Novedades abiertas</Typography>
					<Stack spacing={1}>
						{data.openIncidents.map((incident) => (
							<Alert key={incident.id} severity={incident.type === 'NEGATIVE_BALANCE' ? 'error' : 'warning'} sx={{ fontSize: '0.85rem' }}>
								<strong>{incident.typeLabel}:</strong> {incident.detail}
							</Alert>
						))}
					</Stack>
				</Paper>
			)}
		</Stack>
	);
}

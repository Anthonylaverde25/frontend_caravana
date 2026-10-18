import { useState } from 'react';
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useItemStock } from '@/features/stock/hooks/useItemStock';
import { useResolveStockIncident } from '@/features/stock/hooks/useStockOperations';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { StockIncident } from '@/core/stock/domain/entities/ItemDocument';
import { WarehouseStock } from '@/core/stock/domain/entities/ItemStock';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import ReasonDialog from '@/ui/stock/components/dialogs/ReasonDialog';
import WarehouseStockCard from './WarehouseStockCard';
import CountStockDialog from './CountStockDialog';

/** The Stock tab: one card per warehouse with "Contar", and the item's open notices with "Resolver". */
export default function ItemStockTab({ item }: { item: ItemDetail }) {
	const { enqueueSnackbar } = useSnackbar();
	const { data, isLoading } = useItemStock(item.id);
	const { mutateAsync: resolve, isPending } = useResolveStockIncident();
	const [counting, setCounting] = useState<WarehouseStock | null>(null);
	const [resolving, setResolving] = useState<StockIncident | null>(null);
	const [resolveError, setResolveError] = useState<string | null>(null);

	if (isLoading || !data) {
		return <CircularProgress size={24} />;
	}

	const confirmResolve = async (resolution: string) => {
		if (!resolving) return;
		try {
			await resolve({ id: resolving.id, resolution });
			setResolving(null);
			enqueueSnackbar('Novedad resuelta.', { variant: 'success' });
		} catch (error) {
			setResolveError(readApiErrors(error, 'No se pudo resolver.').domain ?? 'No se pudo resolver.');
		}
	};

	return (
		<Stack spacing={2} sx={{ maxWidth: 960 }}>
			{data.warehouses.length === 0 ? (
				<Alert severity="info">Todavía no tuvo movimientos. Entra al almacén con un comprobante de compra o con el stock inicial.</Alert>
			) : (
				data.warehouses.map((stock) => (
					<WarehouseStockCard key={stock.warehouse.id} itemId={item.id} stock={stock} unitSymbol={item.unit?.symbol ?? null} onCount={() => setCounting(stock)}
						pendingLots={data.pendingLots.filter((lot) => lot.warehouseId === stock.warehouse.id)} />
				))
			)}
			{data.openIncidents.length > 0 && (
				<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
					<Typography sx={{ fontWeight: 700, mb: 1 }}>Novedades abiertas</Typography>
					<Stack spacing={1}>
						{data.openIncidents.map((incident) => (
							<Alert key={incident.id} severity={incident.type === 'NEGATIVE_BALANCE' ? 'error' : 'warning'} sx={{ fontSize: '0.85rem', alignItems: 'center' }}
								action={
									incident.resolvesItself ? undefined : (
										<Button size="small" color="inherit" onClick={() => { setResolveError(null); setResolving(incident); }} sx={{ textTransform: 'none', fontWeight: 700 }}>
											Resolver
										</Button>
									)
								}>
								<strong>{incident.typeLabel}:</strong> {incident.detail}
								{incident.resolvesItself && ' Se resuelve sola cuando el saldo se recupera.'}
							</Alert>
						))}
					</Stack>
				</Paper>
			)}

			{counting && <CountStockDialog item={item} stock={counting} onClose={() => setCounting(null)} />}
			<ReasonDialog
				open={!!resolving}
				title={`Resolver ${resolving?.typeLabel.toLowerCase() ?? ''}`}
				consequences={resolving ? [resolving.detail] : []}
				confirmLabel="Resolver"
				reasonLabel="Cómo se resolvió"
				note="La novedad queda cerrada con esta explicación, que se ve en su historial."
				confirmColor="primary"
				busy={isPending}
				error={resolveError}
				onClose={() => setResolving(null)}
				onConfirm={confirmResolve}
			/>
		</Stack>
	);
}

import { useState } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import { useItem } from '@/features/items/hooks/useItems';
import { useSetItemActive } from '@/features/items/hooks/useItemMutations';
import ItemDetailHeader from '../components/detail/ItemDetailHeader';
import ItemGeneralTab from '../components/detail/ItemGeneralTab';
import ItemPresentationsTab from '../components/detail/ItemPresentationsTab';
import ItemProvidersTab from '../components/detail/ItemProvidersTab';
import ItemStockTab from '../components/stock/ItemStockTab';
import ItemKardexTab from '../components/stock/ItemKardexTab';
import ItemFormDialog from '../components/dialogs/ItemFormDialog';
import SetActiveDialog from '../components/dialogs/SetActiveDialog';

type DetailTab = 'general' | 'presentations' | 'providers' | 'stock' | 'kardex';
const TABS: DetailTab[] = ['general', 'presentations', 'providers', 'stock', 'kardex'];

/**
 * The item's file: general data, presentations, providers and, for stock-tracked articles, Stock and
 * Kardex. An item of another company answers 404 and is shown as not found.
 */
export default function ItemDetailView() {
	const { itemId } = useParams();
	const id = /^\d+$/.test(itemId ?? '') ? Number(itemId) : null;
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = (TABS.find((t) => t === searchParams.get('tab')) ?? 'general') as DetailTab;
	const { data: item, isLoading, isError } = useItem(id);
	const { mutateAsync: setActive } = useSetItemActive();
	const [editing, setEditing] = useState(false);
	const [toggling, setToggling] = useState(false);

	if (isLoading) {
		return (
			<ViewLayout title="Artículo o servicio">
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress />
				</Box>
			</ViewLayout>
		);
	}

	if (!id || isError || !item) {
		return (
			<ViewLayout title="Ítem no encontrado" backUrl="/items" showBackButton backTitle="Artículos y servicios">
				<Stack spacing={2} alignItems="flex-start">
					<Typography color="text.secondary">El ítem no existe en esta empresa.</Typography>
					<Button component={RouterLink} to="/items" variant="outlined" sx={{ textTransform: 'none' }}>
						Volver al catálogo
					</Button>
				</Stack>
			</ViewLayout>
		);
	}

	return (
		<ViewLayout title="Artículo o servicio" backUrl="/items" showBackButton backTitle="Artículos y servicios">
			<Stack spacing={2.5}>
				<ItemDetailHeader item={item} onEdit={() => setEditing(true)} onToggleActive={() => setToggling(true)} />
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<Tabs value={tab} onChange={(_, value: DetailTab) => setSearchParams({ tab: value }, { replace: true })}>
						<Tab value="general" label="General" sx={{ textTransform: 'none', fontWeight: 600 }} />
						<Tab value="presentations" label={`Presentaciones ${item.presentations.length}`} sx={{ textTransform: 'none', fontWeight: 600 }} />
						<Tab value="providers" label={`Proveedores ${item.providers.length}`} sx={{ textTransform: 'none', fontWeight: 600 }} />
						{item.trackStock && <Tab value="stock" label="Stock" sx={{ textTransform: 'none', fontWeight: 600 }} />}
						{item.trackStock && <Tab value="kardex" label="Kardex" sx={{ textTransform: 'none', fontWeight: 600 }} />}
					</Tabs>
				</Box>
				{tab === 'general' && <ItemGeneralTab item={item} />}
				{tab === 'presentations' && <ItemPresentationsTab item={item} />}
				{tab === 'providers' && <ItemProvidersTab item={item} />}
				{tab === 'stock' && item.trackStock && <ItemStockTab item={item} />}
				{tab === 'kardex' && item.trackStock && <ItemKardexTab item={item} />}
			</Stack>

			<ItemFormDialog open={editing} item={item} onClose={() => setEditing(false)} />
			<SetActiveDialog
				open={toggling}
				onClose={() => setToggling(false)}
				subject={item.name}
				activate={!item.isActive}
				consequence={
					item.isActive
						? 'Sigue en el catálogo, pero no se ofrece para cargar compras ni consumos.'
						: 'Vuelve a ofrecerse para cargar compras y consumos.'
				}
				onConfirm={() => setActive({ id: item.id, active: !item.isActive })}
			/>
		</ViewLayout>
	);
}

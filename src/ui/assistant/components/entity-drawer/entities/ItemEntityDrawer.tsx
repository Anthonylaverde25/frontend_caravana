import { Stack } from '@mui/material';
import type { WarehouseStock } from '@/core/stock/domain/entities/ItemStock';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { useItem } from '@/features/items/hooks/useItems';
import { useItemStock } from '@/features/stock/hooks/useItemStock';
import ItemBehaviorChip from '@/ui/items/components/ItemBehaviorChip';
import ItemGeneralTab from '@/ui/items/components/detail/ItemGeneralTab';
import EntityDrawerShell from '../EntityDrawerShell';
import EntityListGrid, { type EntityListColumn } from '../components/EntityListGrid';
import type { EntityDrawerProps } from './entityDrawerProps';

/** An item's sheet and its balance per warehouse; counting and transfers stay on the item screen. */
export function ItemEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: item, isLoading, isError } = useItem(id);
	const { data: stock } = useItemStock(item?.trackStock ? id : null);
	const unit = item?.unit?.symbol ?? null;

	const columns: EntityListColumn<WarehouseStock>[] = [
		{
			key: 'warehouse',
			label: 'Depósito',
			width: 200,
			value: (s) => [s.warehouse.code, s.warehouse.name].filter(Boolean).join(' · '),
			link: (s) => ({ kind: 'warehouse', id: s.warehouse.id })
		},
		{ key: 'quantity', label: 'Saldo', align: 'right', value: (s) => formatQuantity(s.quantity, unit) },
		{ key: 'average', label: 'Costo promedio', align: 'right', value: (s) => formatMoney(s.averageUnitCost) },
		{ key: 'value', label: 'Valuación', align: 'right', value: (s) => formatMoney(s.value) }
	];

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:cube"
			title={item?.name ?? label ?? 'Artículo'}
			chip={item && <ItemBehaviorChip behavior={item.behavior} />}
			subtitle={item ? [item.code, item.category?.path].filter(Boolean).join(' · ') : undefined}
			isLoading={isLoading}
			isError={isError}
			screen={{ route: `/items/${id}`, label: 'Abrir artículo' }}
			onNavigate={onNavigate}
		>
			{item && (
				<Stack spacing={2.5}>
					<ItemGeneralTab item={item} />
					{item.trackStock && (
						<EntityListGrid
							title="Stock por depósito"
							columns={columns}
							rows={stock?.warehouses ?? []}
							rowKey={(s) => s.warehouse.id}
							empty="Todavía no tuvo movimientos."
						/>
					)}
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default ItemEntityDrawer;

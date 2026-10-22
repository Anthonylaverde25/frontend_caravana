import type { Item } from '@/core/items/domain/entities/Item';
import { behaviorInfo } from '@/core/items/domain/rules/itemBehavior';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { useItems } from '@/features/items/hooks/useItems';
import EntityDrawerShell from '../EntityDrawerShell';
import EntityListGrid, { type EntityListColumn } from '../components/EntityListGrid';
import type { EntityDrawerProps } from './entityDrawerProps';

const COLUMNS: EntityListColumn<Item>[] = [
	{ key: 'code', label: 'Código', width: 100, tag: true, value: (i) => i.code },
	{ key: 'name', label: 'Artículo', width: 200, value: (i) => i.name, link: (i) => ({ kind: 'item', id: i.id }) },
	{ key: 'behavior', label: 'Rubro', width: 140, value: (i) => behaviorInfo(i.behavior).label },
	{
		key: 'stock',
		label: 'Stock',
		align: 'right',
		value: (i) => (i.trackStock && i.stock ? formatQuantity(i.stock.quantity, i.unit?.symbol) : '—')
	},
	{ key: 'value', label: 'Valuación', align: 'right', value: (i) => (i.stock ? formatMoney(i.stock.value) : '—') }
];

/** The items of one category, its subcategories included; each item opens on top. */
export function ItemCategoryEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: items, isLoading, isError } = useItems({ categoryId: id });

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:folder"
			title={label ?? 'Categoría'}
			subtitle={items ? `${items.length} artículo(s), con sus subcategorías` : undefined}
			isLoading={isLoading}
			isError={isError}
			screen={{ route: '/items', label: 'Abrir artículos' }}
			onNavigate={onNavigate}
		>
			{items && (
				<EntityListGrid
					title="Artículos"
					columns={COLUMNS}
					rows={items}
					rowKey={(i) => i.id}
					empty="No hay artículos en esta categoría."
				/>
			)}
		</EntityDrawerShell>
	);
}

export default ItemCategoryEntityDrawer;

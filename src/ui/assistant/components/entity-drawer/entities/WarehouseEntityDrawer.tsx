import type { WarehouseItemBalance } from '@/core/stock/domain/entities/ItemStock';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { useWarehouseStock } from '@/features/stock/hooks/useItemStock';
import EntityDrawerShell from '../EntityDrawerShell';
import EntityListGrid, { type EntityListColumn } from '../components/EntityListGrid';
import type { EntityDrawerProps } from './entityDrawerProps';

const COLUMNS: EntityListColumn<WarehouseItemBalance>[] = [
	{ key: 'code', label: 'Código', width: 100, tag: true, value: (r) => r.code },
	{
		key: 'name',
		label: 'Artículo',
		width: 220,
		value: (r) => r.name,
		link: (r) => ({ kind: 'item', id: r.itemId })
	},
	{
		key: 'quantity',
		label: 'Saldo',
		align: 'right',
		value: (r) =>
			`${formatQuantity(r.quantity, r.unitSymbol)}${r.isNegative ? ' (negativo)' : r.isBelowCritical ? ' (crítico)' : ''}`
	},
	{ key: 'average', label: 'Costo promedio', align: 'right', value: (r) => formatMoney(r.averageUnitCost) },
	{ key: 'value', label: 'Valuación', align: 'right', value: (r) => formatMoney(r.value) }
];

/** What a warehouse holds, item by item; each item opens on top. */
export function WarehouseEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data, isLoading, isError } = useWarehouseStock(id);
	const warehouse = data?.warehouse;

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:building-storefront"
			title={warehouse ? `${warehouse.code} · ${warehouse.name}` : (label ?? 'Depósito')}
			subtitle={
				warehouse
					? [
							warehouse.isDefault ? 'Predeterminado' : null,
							warehouse.isActive ? null : 'Inactivo',
							`${data.items.length} artículo(s) con saldo`
						]
							.filter(Boolean)
							.join(' · ')
					: undefined
			}
			isLoading={isLoading}
			isError={isError}
			screen={{ route: '/warehouses', label: 'Abrir depósitos' }}
			onNavigate={onNavigate}
		>
			{data && (
				<EntityListGrid
					title="Stock del depósito"
					columns={COLUMNS}
					rows={data.items}
					rowKey={(r) => r.itemId}
					empty="El depósito no tiene artículos con saldo."
				/>
			)}
		</EntityDrawerShell>
	);
}

export default WarehouseEntityDrawer;

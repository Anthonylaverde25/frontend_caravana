import { Item, WarehouseBalance } from '@/core/items/domain/entities/Item';
import { Warehouse } from '../entities/ItemStock';
import { type Dec, dec, sub, ZERO } from './decimal';

/** Only active warehouses take new loads or receive transfers (R4). */
export const activeWarehouses = (warehouses: Warehouse[]): Warehouse[] => warehouses.filter((w) => w.isActive);

/** The picker shows only with more than one active warehouse (DD6). */
export const needsWarehousePicker = (warehouses: Warehouse[]): boolean => activeWarehouses(warehouses).length > 1;

export const defaultWarehouse = (warehouses: Warehouse[]): Warehouse | undefined => warehouses.find((w) => w.isDefault);

export const warehouseLabel = (w: Pick<Warehouse, 'code' | 'name'>): string => `${w.code} · ${w.name}`;

/** What an item holds in one warehouse, or across all of them when none is chosen. */
export function stockIn(item: Item | undefined, warehouseId: number | null): Omit<WarehouseBalance, 'warehouseId'> | null {
	if (!item?.stock) return null;
	if (warehouseId === null) return item.stock;
	return item.stock.byWarehouse.find((w) => w.warehouseId === warehouseId) ?? { quantity: '0.0000', unvaluedQuantity: '0.0000', value: '0.0000' };
}

/** What may move in a transfer: the valued units, never below zero (DD8, Q2). */
export function transferableQuantity(balance: Omit<WarehouseBalance, 'warehouseId'> | null): Dec {
	if (!balance) return ZERO;
	const valued = sub(dec(balance.quantity) ?? ZERO, dec(balance.unvaluedQuantity) ?? ZERO);
	return valued > ZERO ? valued : ZERO;
}

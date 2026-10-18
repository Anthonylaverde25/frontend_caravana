import { Page } from '../entities/ItemDocument';
import { ItemStockView, KardexFilters, KardexRow, Warehouse } from '../entities/ItemStock';

export interface IItemStockRepository {
	findByItem(itemId: number): Promise<ItemStockView>;
	kardex(itemId: number, filters: KardexFilters): Promise<Page<KardexRow>>;
	setCriticalStock(itemId: number, warehouseId: number, level: string | null): Promise<ItemStockView>;
	warehouses(): Promise<Warehouse[]>;
}

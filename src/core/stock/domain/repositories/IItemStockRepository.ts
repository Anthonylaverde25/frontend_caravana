import { Page, StockIncident } from '../entities/ItemDocument';
import { BatchConsumptionHistory, ItemStockView, KardexFilters, KardexRow, Warehouse } from '../entities/ItemStock';

export interface IItemStockRepository {
	findByItem(itemId: number): Promise<ItemStockView>;
	kardex(itemId: number, filters: KardexFilters): Promise<Page<KardexRow>>;
	setCriticalStock(itemId: number, warehouseId: number, level: string | null): Promise<ItemStockView>;
	warehouses(): Promise<Warehouse[]>;
	nextWarehouseCode(): Promise<string>;
	createWarehouse(code: string, name: string): Promise<Warehouse>;
	updateWarehouse(id: number, code: string, name: string): Promise<Warehouse>;
	/** The whole list: two rows change at once (DD2). */
	setDefaultWarehouse(id: number): Promise<Warehouse[]>;
	/** Deactivating the default names the next one (DD3). */
	setWarehouseActive(id: number, active: boolean, newDefaultId: number | null): Promise<Warehouse[]>;
	resolveIncident(id: number, resolution: string): Promise<StockIncident>;
	batchHistory(batchId: number): Promise<BatchConsumptionHistory>;
}

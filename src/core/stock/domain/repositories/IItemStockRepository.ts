import { Page, StockIncident } from '../entities/ItemDocument';
import { BatchConsumptionHistory, ItemStockView, KardexFilters, KardexRow, Warehouse } from '../entities/ItemStock';

export interface IItemStockRepository {
	findByItem(itemId: number): Promise<ItemStockView>;
	kardex(itemId: number, filters: KardexFilters): Promise<Page<KardexRow>>;
	setCriticalStock(itemId: number, warehouseId: number, level: string | null): Promise<ItemStockView>;
	warehouses(): Promise<Warehouse[]>;
	resolveIncident(id: number, resolution: string): Promise<StockIncident>;
	batchHistory(batchId: number): Promise<BatchConsumptionHistory>;
}

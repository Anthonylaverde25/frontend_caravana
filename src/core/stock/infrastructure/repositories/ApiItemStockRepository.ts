import axiosInstance from '@/utils/axios';
import { Page, StockIncident } from '../../domain/entities/ItemDocument';
import { BatchConsumptionHistory, ItemStockView, KardexFilters, KardexRow, Warehouse } from '../../domain/entities/ItemStock';
import { IItemStockRepository } from '../../domain/repositories/IItemStockRepository';
import { StockMapper } from '../mappers/StockMapper';

export class ApiItemStockRepository implements IItemStockRepository {
	async findByItem(itemId: number): Promise<ItemStockView> {
		const response = await axiosInstance.get<any>(`/items/${itemId}/stock`);
		return StockMapper.stockView(response.data);
	}

	async kardex(itemId: number, filters: KardexFilters): Promise<Page<KardexRow>> {
		const response = await axiosInstance.get<any>(`/items/${itemId}/kardex`, { params: { from: filters.from, to: filters.to, page: filters.page } });
		return StockMapper.page(response.data, StockMapper.kardexRow);
	}

	async setCriticalStock(itemId: number, warehouseId: number, level: string | null): Promise<ItemStockView> {
		const response = await axiosInstance.patch<any>(`/items/${itemId}/stock/${warehouseId}/critical`, { critical_stock: level });
		return StockMapper.stockView(response.data);
	}

	async resolveIncident(id: number, resolution: string): Promise<StockIncident> {
		const response = await axiosInstance.patch<any>(`/stock-incidents/${id}/resolve`, { resolution });
		return StockMapper.incident(response.data);
	}

	async batchHistory(batchId: number): Promise<BatchConsumptionHistory> {
		const response = await axiosInstance.get<any>(`/batches/${batchId}/consumption-history`);
		return StockMapper.batchHistory(response.data);
	}

	async warehouses(): Promise<Warehouse[]> {
		const response = await axiosInstance.get<any[]>('/warehouses');
		return response.data.map((w) => ({ id: w.id, code: w.code, name: w.name, isDefault: !!w.is_default }));
	}
}

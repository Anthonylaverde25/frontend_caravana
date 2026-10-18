import axiosInstance from '@/utils/axios';
import { Page } from '../../domain/entities/ItemDocument';
import { ItemStockView, KardexFilters, KardexRow, Warehouse } from '../../domain/entities/ItemStock';
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

	async warehouses(): Promise<Warehouse[]> {
		const response = await axiosInstance.get<any[]>('/warehouses');
		return response.data.map((w) => ({ id: w.id, code: w.code, name: w.name, isDefault: !!w.is_default }));
	}
}

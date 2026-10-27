import axiosInstance from '@/utils/axios';
import { Page, StockIncident } from '../../domain/entities/ItemDocument';
import {
	BatchConsumptionHistory,
	ItemStockView,
	KardexFilters,
	KardexRow,
	Warehouse,
	WarehouseKind,
	WarehouseStockView
} from '../../domain/entities/ItemStock';
import { IItemStockRepository } from '../../domain/repositories/IItemStockRepository';
import { StockMapper } from '../mappers/StockMapper';

export class ApiItemStockRepository implements IItemStockRepository {
	async findByItem(itemId: number): Promise<ItemStockView> {
		const response = await axiosInstance.get<any>(`/items/${itemId}/stock`);
		return StockMapper.stockView(response.data);
	}

	async kardex(itemId: number, filters: KardexFilters): Promise<Page<KardexRow>> {
		const response = await axiosInstance.get<any>(`/items/${itemId}/kardex`, { params: { warehouse_id: filters.warehouseId, from: filters.from, to: filters.to, page: filters.page } });
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
		return response.data.map(StockMapper.warehouse);
	}

	async warehouseStock(warehouseId: number): Promise<WarehouseStockView> {
		const response = await axiosInstance.get<any>(`/warehouses/${warehouseId}/stock`);
		return StockMapper.warehouseStock(response.data);
	}

	async nextWarehouseCode(): Promise<string> {
		const response = await axiosInstance.get<{ code: string }>('/warehouses/next-code');
		return response.data.code;
	}

	async createWarehouse(code: string, name: string, kind: WarehouseKind): Promise<Warehouse> {
		const response = await axiosInstance.post<any>('/warehouses', { code, name, kind });
		return StockMapper.warehouse(response.data);
	}

	async updateWarehouse(id: number, code: string, name: string, kind: WarehouseKind): Promise<Warehouse> {
		const response = await axiosInstance.patch<any>(`/warehouses/${id}`, { code, name, kind });
		return StockMapper.warehouse(response.data);
	}

	async setDefaultWarehouse(id: number): Promise<Warehouse[]> {
		const response = await axiosInstance.patch<any[]>(`/warehouses/${id}/default`);
		return response.data.map(StockMapper.warehouse);
	}

	async setWarehouseActive(id: number, active: boolean, newDefaultId: number | null): Promise<Warehouse[]> {
		const response = await axiosInstance.patch<any[]>(`/warehouses/${id}/active`, { is_active: active, new_default_id: newDefaultId });
		return response.data.map(StockMapper.warehouse);
	}
}

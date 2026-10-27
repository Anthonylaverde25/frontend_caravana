import axiosInstance from '@/utils/axios';
import { ItemDocument } from '@/core/stock/domain/entities/ItemDocument';
import { StockMapper } from '@/core/stock/infrastructure/mappers/StockMapper';
import {
	SemenInventoryRow,
	SemenLotDetail,
	SemenLotOption,
	SemenLotSharePayload,
	SemenProfile,
	SemenProfilePayload,
	SemenReceiptPayload,
	SemenSire,
	SemenSirePayload,
	SemenUnidentifiedEntry
} from '../../domain/entities/Semen';
import { ISemenRepository, SemenInventoryFilters } from '../../domain/repositories/ISemenRepository';
import { SemenMapper } from '../mappers/SemenMapper';

export class ApiSemenRepository implements ISemenRepository {
	async sires(search?: string, includeInactive = false): Promise<SemenSire[]> {
		const response = await axiosInstance.get<any[]>('/semen/sires', { params: { search: search || undefined, include_inactive: includeInactive ? 1 : undefined } });
		return response.data.map(SemenMapper.sire);
	}

	async createSire(payload: SemenSirePayload): Promise<SemenSire> {
		const response = await axiosInstance.post<any>('/semen/sires', payload);
		return SemenMapper.sire(response.data);
	}

	async updateSire(id: number, payload: SemenSirePayload): Promise<SemenSire> {
		const response = await axiosInstance.patch<any>(`/semen/sires/${id}`, payload);
		return SemenMapper.sire(response.data);
	}

	async setSireActive(id: number, active: boolean): Promise<SemenSire> {
		const response = await axiosInstance.patch<any>(`/semen/sires/${id}/active`, { is_active: active });
		return SemenMapper.sire(response.data);
	}

	async registerReceipt(payload: SemenReceiptPayload): Promise<ItemDocument> {
		const response = await axiosInstance.post<any>('/semen/receipts', payload);
		return StockMapper.document(response.data);
	}

	async inventory(filters: SemenInventoryFilters): Promise<SemenInventoryRow[]> {
		const response = await axiosInstance.get<any[]>('/semen/inventory', {
			params: {
				warehouse_id: filters.warehouseId ?? undefined,
				with_balance: filters.withBalance ? 1 : undefined,
				include_inactive: filters.includeInactive ? 1 : undefined
			}
		});
		return response.data.map(SemenMapper.inventoryRow);
	}

	async lots(itemId: number, warehouseId: number): Promise<SemenLotOption[]> {
		const response = await axiosInstance.get<any[]>('/semen/lots', { params: { item_id: itemId, warehouse_id: warehouseId } });
		return response.data.map(SemenMapper.lotOption);
	}

	async lot(id: number): Promise<SemenLotDetail> {
		const response = await axiosInstance.get<any>(`/semen/lots/${id}`);
		return SemenMapper.lotDetail(response.data);
	}

	async unidentified(itemId?: number, warehouseId?: number): Promise<SemenUnidentifiedEntry[]> {
		const response = await axiosInstance.get<any[]>('/semen/unidentified', { params: { item_id: itemId, warehouse_id: warehouseId } });
		return response.data.map(SemenMapper.unidentified);
	}

	async identify(entryId: number, lots: SemenLotSharePayload[]): Promise<{ status: string; pendingQuantity: string }> {
		const response = await axiosInstance.post<any>(`/semen/unidentified/${entryId}/identify`, { lots });
		return { status: response.data.status, pendingQuantity: response.data.pending_quantity };
	}

	async updateProfile(itemId: number, payload: SemenProfilePayload): Promise<SemenProfile | null> {
		const response = await axiosInstance.patch<any>(`/items/${itemId}/semen-profile`, payload);
		return SemenMapper.profile(response.data);
	}
}

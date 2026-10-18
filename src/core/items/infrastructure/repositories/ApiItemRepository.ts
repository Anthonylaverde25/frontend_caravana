import axiosInstance from '@/utils/axios';
import { Item, ItemDetail, ItemFilters, ItemPayload, ItemPresentation } from '../../domain/entities/Item';
import { IItemRepository, ProviderLinkPayload } from '../../domain/repositories/IItemRepository';
import { ItemMapper } from '../mappers/ItemMapper';

export class ApiItemRepository implements IItemRepository {
	async search(filters: ItemFilters): Promise<Item[]> {
		const response = await axiosInstance.get<any[]>('/items', {
			params: {
				behavior: filters.behavior,
				category_id: filters.categoryId,
				search: filters.search || undefined,
				include_inactive: filters.includeInactive ? 1 : undefined
			}
		});
		return response.data.map(ItemMapper.toDomain);
	}

	async findById(id: number): Promise<ItemDetail> {
		const response = await axiosInstance.get<any>(`/items/${id}`);
		return ItemMapper.toDetail(response.data);
	}

	async create(payload: ItemPayload): Promise<ItemDetail> {
		const response = await axiosInstance.post<any>('/items', payload);
		return ItemMapper.toDetail(response.data);
	}

	async update(id: number, payload: Partial<ItemPayload>): Promise<ItemDetail> {
		const response = await axiosInstance.patch<any>(`/items/${id}`, payload);
		return ItemMapper.toDetail(response.data);
	}

	async setActive(id: number, active: boolean): Promise<ItemDetail> {
		const response = await axiosInstance.patch<any>(`/items/${id}/active`, { is_active: active });
		return ItemMapper.toDetail(response.data);
	}

	async addPresentation(itemId: number, name: string, factor: number): Promise<ItemPresentation> {
		const response = await axiosInstance.post<any>(`/items/${itemId}/presentations`, { name, factor_to_item_unit: factor });
		return ItemMapper.presentationToDomain(response.data);
	}

	async updatePresentation(itemId: number, presentationId: number, name: string, factor: number): Promise<ItemPresentation> {
		const response = await axiosInstance.patch<any>(`/items/${itemId}/presentations/${presentationId}`, {
			name,
			factor_to_item_unit: factor
		});
		return ItemMapper.presentationToDomain(response.data);
	}

	async setPresentationActive(itemId: number, presentationId: number, active: boolean): Promise<ItemPresentation> {
		const response = await axiosInstance.patch<any>(`/items/${itemId}/presentations/${presentationId}/active`, { is_active: active });
		return ItemMapper.presentationToDomain(response.data);
	}

	async syncProviders(itemId: number, links: ProviderLinkPayload[]): Promise<ItemDetail> {
		const response = await axiosInstance.put<any>(`/items/${itemId}/providers`, { providers: links });
		return ItemMapper.toDetail(response.data);
	}
}

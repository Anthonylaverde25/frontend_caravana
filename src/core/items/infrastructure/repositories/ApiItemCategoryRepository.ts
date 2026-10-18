import axiosInstance from '@/utils/axios';
import { ItemCategory } from '../../domain/entities/ItemCategory';
import { IItemCategoryRepository, ItemCategoryPayload } from '../../domain/repositories/IItemCategoryRepository';
import { ItemCategoryMapper } from '../mappers/ItemCategoryMapper';

export class ApiItemCategoryRepository implements IItemCategoryRepository {
	async findAll(includeInactive: boolean): Promise<ItemCategory[]> {
		const response = await axiosInstance.get<any[]>('/item-categories', { params: includeInactive ? { include_inactive: 1 } : undefined });
		return response.data.map(ItemCategoryMapper.toDomain);
	}

	async create(payload: ItemCategoryPayload): Promise<ItemCategory> {
		const response = await axiosInstance.post<any>('/item-categories', payload);
		return ItemCategoryMapper.toDomain(response.data);
	}

	async update(id: number, payload: Partial<ItemCategoryPayload>): Promise<ItemCategory> {
		const response = await axiosInstance.patch<any>(`/item-categories/${id}`, payload);
		return ItemCategoryMapper.toDomain(response.data);
	}

	async setActive(id: number, active: boolean): Promise<ItemCategory> {
		const response = await axiosInstance.patch<any>(`/item-categories/${id}/active`, { is_active: active });
		return ItemCategoryMapper.toDomain(response.data);
	}
}

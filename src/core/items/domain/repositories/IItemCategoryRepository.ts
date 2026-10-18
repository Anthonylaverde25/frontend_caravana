import { ItemCategory } from '../entities/ItemCategory';

export interface ItemCategoryPayload {
	name: string;
	parent_id: number | null;
}

export interface IItemCategoryRepository {
	findAll(includeInactive: boolean): Promise<ItemCategory[]>;
	create(payload: ItemCategoryPayload): Promise<ItemCategory>;
	update(id: number, payload: Partial<ItemCategoryPayload>): Promise<ItemCategory>;
	setActive(id: number, active: boolean): Promise<ItemCategory>;
}

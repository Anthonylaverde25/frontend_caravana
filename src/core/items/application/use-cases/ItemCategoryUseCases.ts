import { ItemCategory } from '../../domain/entities/ItemCategory';
import { IItemCategoryRepository, ItemCategoryPayload } from '../../domain/repositories/IItemCategoryRepository';

export class ListItemCategoriesUseCase {
	constructor(private repository: IItemCategoryRepository) {}

	execute(includeInactive: boolean): Promise<ItemCategory[]> {
		return this.repository.findAll(includeInactive);
	}
}

export class SaveItemCategoryUseCase {
	constructor(private repository: IItemCategoryRepository) {}

	execute(payload: ItemCategoryPayload, id?: number): Promise<ItemCategory> {
		const body = { ...payload, name: payload.name.trim() };
		return id ? this.repository.update(id, body) : this.repository.create(body);
	}
}

export class SetItemCategoryActiveUseCase {
	constructor(private repository: IItemCategoryRepository) {}

	execute(id: number, active: boolean): Promise<ItemCategory> {
		return this.repository.setActive(id, active);
	}
}

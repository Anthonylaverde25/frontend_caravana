import { ItemCategory } from '../../domain/entities/ItemCategory';

export const ItemCategoryMapper = {
	toDomain(raw: any): ItemCategory {
		return {
			id: raw.id,
			code: raw.code,
			name: raw.name,
			parentId: raw.parent_id ?? null,
			isActive: !!raw.is_active,
			displayOrder: raw.display_order ?? 0,
			itemsCount: raw.items_count ?? 0
		};
	}
};

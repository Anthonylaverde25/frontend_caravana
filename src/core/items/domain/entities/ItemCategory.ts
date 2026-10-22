/** A node of the company's category tree, as the API returns it (flat). */
export interface ItemCategory {
	id: number;
	code: string;
	name: string;
	parentId: number | null;
	isActive: boolean;
	displayOrder: number;
	itemsCount: number;
	/** Belongs to the software: cannot be renamed, moved or deactivated; still takes subcategories. */
	isSystem: boolean;
}

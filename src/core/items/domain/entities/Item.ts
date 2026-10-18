import { ItemBehavior } from '../rules/itemBehavior';

export interface ItemUnitRef {
	id: number;
	code: string;
	symbol: string;
	name: string;
	isConvertible: boolean;
}

export interface ItemCategoryRef {
	id: number;
	name: string;
	/** "Sanidad › Antiparasitarios › Endectocidas" */
	path: string;
}

/** Commercial packaging: how many item units one presentation holds. */
export interface ItemPresentation {
	id: number;
	itemId: number;
	name: string;
	factorToItemUnit: number;
	isActive: boolean;
}

/** A provider that sells the item. */
export interface ItemProviderLink {
	providerId: number;
	name: string;
	cuit: string;
	leadTimeDays: number | null;
	isPreferred: boolean;
}

/** An article or a service of the company's catalog. */
export interface Item {
	id: number;
	code: string;
	name: string;
	description: string | null;
	type: 'ARTICLE' | 'SERVICE';
	trackStock: boolean;
	behavior: ItemBehavior;
	isActive: boolean;
	unit: ItemUnitRef | null;
	category: ItemCategoryRef | null;
	presentationsCount: number;
	providersCount: number;
}

export interface ItemDetail extends Item {
	presentations: ItemPresentation[];
	providers: ItemProviderLink[];
}

export interface ItemFilters {
	behavior?: ItemBehavior;
	categoryId?: number;
	search?: string;
	includeInactive?: boolean;
}

export interface ItemPayload {
	name: string;
	behavior: ItemBehavior;
	unit_of_measure_id: number;
	item_category_id: number | null;
	/** Empty: the company's next ART-/SRV- code. */
	code: string | null;
	description: string | null;
}

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

/** The last registered invoice or ticket line of the item from one provider (DS2). */
export interface ItemLastPurchase {
	fiscalDocumentId: number;
	label: string;
	issuedAt: string;
	unitPrice: string;
	inputLabel: string;
}

/** A provider that sells the item. */
export interface ItemProviderLink {
	providerId: number;
	name: string;
	cuit: string;
	leadTimeDays: number | null;
	isPreferred: boolean;
	lastPurchase: ItemLastPurchase | null;
}

/** Balance of a stock-tracked article across warehouses, and its open stock alerts. */
export interface ItemStockSummary {
	quantity: string;
	/** Units waiting for their invoice (delivery C): in the balance, not in the value. */
	unvaluedQuantity: string;
	value: string;
	hasNegative: boolean;
	hasCritical: boolean;
	/** What each active warehouse holds (delivery D, H5): the available amount of a consumption or a transfer. */
	byWarehouse: WarehouseBalance[];
}

export interface WarehouseBalance {
	warehouseId: number;
	quantity: string;
	unvaluedQuantity: string;
	value: string;
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
	/** Null for services and non-stock articles. */
	stock: ItemStockSummary | null;
	/** VAT rate of its last letter-A invoice, to preload it on the next one (DS18). */
	lastVatRateId: number | null;
}

export interface ItemDetail extends Item {
	presentations: ItemPresentation[];
	providers: ItemProviderLink[];
	/** With lines in documents or operations, unit and behavior can no longer change. */
	hasMovements: boolean;
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

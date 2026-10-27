import { StockIncident } from './ItemDocument';

/** An item's balance in one warehouse. */
export interface WarehouseStock {
	warehouse: { id: number; code: string | null; name: string | null; isActive: boolean };
	quantity: string;
	/** Units waiting for their invoice (delivery C): the average and the value are of the rest. */
	unvaluedQuantity: string;
	valuedQuantity: string;
	averageUnitCost: string;
	value: string;
	criticalStock: string | null;
	isBelowCritical: boolean;
}

export interface ItemStockView {
	item: { id: number; name: string; unitSymbol: string | null; trackStock: boolean };
	warehouses: WarehouseStock[];
	openIncidents: StockIncident[];
	/** Units waiting for their invoice, by delivery note. */
	pendingLots: PendingLot[];
}

export interface PendingLot {
	warehouseId: number;
	deliveryNoteId: number;
	deliveryNoteLabel: string;
	issuedAt: string;
	quantity: string;
	remainingQuantity: string;
	consumedQuantity: string;
}

export interface KardexRow {
	id: number;
	occurredAt: string;
	warehouse: string;
	documentId: number;
	documentNumber: number;
	documentType: string;
	documentTypeLabel: string;
	batch: string | null;
	/** "ALM-01 → ALM-02" on either half of a transfer (delivery D). */
	transfer: string | null;
	/** Semen (S-A E9): the lot of the straws that moved; null = without lot. */
	semenLot: { id: number; code: string | null } | null;
	fiscalDocument: { id: number; label: string; provider: string | null } | null;
	/** 0: a valuation, value without units (delivery C). */
	direction: 1 | 0 | -1;
	quantity: string;
	unitCost: string | null;
	totalCost: string;
	balanceAfter: string;
	averageCostAfter: string;
	unvaluedQuantity: string;
	unvaluedBalanceAfter: string;
}

export interface KardexFilters {
	warehouseId?: number;
	from?: string;
	to?: string;
	page?: number;
}

/** One operation the batch received: a consumption or a service / non-stock purchase charged to it. */
export interface BatchHistoryRow {
	source: 'CONSUMPTION' | 'FISCAL_DOCUMENT';
	lineId: number;
	occurredAt: string;
	itemName: string;
	behavior: 'STOCKED_ARTICLE' | 'EXPENSE_ARTICLE' | 'SERVICE';
	category: string | null;
	quantity: string;
	unitSymbol: string;
	headsTreated: number;
	cost: string;
	/** Units of it still waiting for their invoice: their cost is not in `cost` yet (delivery C). */
	pendingCostQuantity: string;
	costPerHead: string | null;
	reference: { kind: 'item_document' | 'fiscal_document'; id: number; label: string };
	voided: string | null;
}

/** What the batch received and what it cost; the cost per head adds up operation by operation. */
export interface BatchConsumptionHistory {
	rows: BatchHistoryRow[];
	totalCost: string;
	costPerHead: string;
	byCategory: { category: string; cost: string }[];
	hasPendingCost: boolean;
}

/**
 * A storage place of the company (D8). Provider papers always enter the default one (DD5); the
 * default is always active (DD3). Never deleted, only deactivated (DD4).
 */
/** One item held by a warehouse (GET /warehouses/{id}/stock). */
export interface WarehouseItemBalance {
	itemId: number;
	code: string;
	name: string;
	unitSymbol: string | null;
	quantity: string;
	unvaluedQuantity: string;
	averageUnitCost: string;
	value: string;
	isNegative: boolean;
	isBelowCritical: boolean;
}

export interface WarehouseStockView {
	warehouse: Warehouse;
	items: WarehouseItemBalance[];
}

/** A general warehouse, or a tank where semen is kept (semen S-0). */
export type WarehouseKind = 'GENERAL' | 'CRYO_TANK';

export interface Warehouse {
	id: number;
	code: string;
	name: string;
	kind: WarehouseKind;
	/** The default of its kind: one general, and at most one tank. */
	isDefault: boolean;
	isActive: boolean;
	/** What it holds, shown before deactivating it (DD4); only in the list. */
	summary: WarehouseSummary | null;
}

export interface WarehouseSummary {
	itemsWithBalance: number;
	valuedValue: string;
	itemsWithUnvalued: number;
	pendingLots: number;
	negativeItems: number;
	openIncidents: number;
}

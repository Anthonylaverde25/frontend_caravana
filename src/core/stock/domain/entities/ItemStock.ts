import { StockIncident } from './ItemDocument';

/** An item's balance in one warehouse. */
export interface WarehouseStock {
	warehouse: { id: number; name: string | null };
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

export interface Warehouse {
	id: number;
	code: string;
	name: string;
	isDefault: boolean;
}

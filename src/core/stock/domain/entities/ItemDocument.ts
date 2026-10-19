/**
 * Stock operations (DS14). Purchases, returns, delivery receipts and valuations come from a provider
 * document; a valuation adds value without moving units (delivery C). A transfer is an exit from one
 * warehouse and an entry into another, paired (delivery D).
 */
export type ItemDocumentType =
	| 'PURCHASE'
	| 'INITIAL'
	| 'CONSUMPTION'
	| 'COUNT_ADJUSTMENT'
	| 'RETURN_TO_PROVIDER'
	| 'REVERSAL'
	| 'DELIVERY_RECEIPT'
	| 'VALUATION'
	| 'TRANSFER_OUT'
	| 'TRANSFER_IN';

/** 'TRANSFER' lists both halves of every transfer. */
export type ItemDocumentFilterType = ItemDocumentType | 'TRANSFER';

export const ITEM_DOCUMENT_TYPES: { value: ItemDocumentFilterType; label: string; filterLabel: string }[] = [
	{ value: 'PURCHASE', label: 'Ingreso por compra', filterLabel: 'Ingresos' },
	{ value: 'CONSUMPTION', label: 'Consumo', filterLabel: 'Consumos' },
	{ value: 'COUNT_ADJUSTMENT', label: 'Conteo', filterLabel: 'Conteos' },
	{ value: 'RETURN_TO_PROVIDER', label: 'Devolución al proveedor', filterLabel: 'Devoluciones' },
	{ value: 'INITIAL', label: 'Stock inicial', filterLabel: 'Stock inicial' },
	{ value: 'REVERSAL', label: 'Anulación', filterLabel: 'Anulaciones' },
	{ value: 'DELIVERY_RECEIPT', label: 'Ingreso por remito', filterLabel: 'Ingresos por remito' },
	{ value: 'VALUATION', label: 'Valorización', filterLabel: 'Valorizaciones' },
	{ value: 'TRANSFER', label: 'Transferencia', filterLabel: 'Transferencias' }
];

export const isTransfer = (type: ItemDocumentType): boolean => type === 'TRANSFER_OUT' || type === 'TRANSFER_IN';

/** "ALM-01 → ALM-02" from either half of a transfer; null for any other operation. */
export function transferRoute(d: Pick<ItemDocument, 'type' | 'warehouse' | 'paired'>): string | null {
	if (!isTransfer(d.type)) return null;
	const own = d.warehouse.code ?? '';
	const other = d.paired?.warehouse.code ?? '';
	return d.type === 'TRANSFER_OUT' ? `${own} → ${other}` : `${other} → ${own}`;
}

export interface WarehouseRef {
	id: number;
	code: string | null;
	name: string | null;
}

/** The other half of a transfer. */
export interface PairedDocument {
	id: number;
	number: number;
	type: ItemDocumentType;
	warehouse: WarehouseRef;
}

export interface StockMovement {
	id: number;
	/** 0: a valuation, value without units (delivery C). */
	direction: 1 | 0 | -1;
	quantity: string;
	balanceAfter: string;
	averageCostAfter: string;
}

export interface ItemDocumentLine {
	id: number;
	position: number;
	item: { id: number; name: string; unitSymbol: string | null };
	inputQuantity: string;
	inputLabel: string | null;
	quantity: string;
	inputUnitPrice: string | null;
	/** Null when no unit of the line has a cost yet (delivery C). */
	unitCost: string | null;
	/** The known cost; the units without cost are unvaluedQuantity. */
	totalCost: string;
	unvaluedQuantity: string;
	/** A valuation no valued stock could take (Q3). */
	unabsorbedCost: string | null;
	countedQuantity: string | null;
	movement: StockMovement | null;
}

export interface Ref {
	id: number;
	label: string;
}

export interface ItemDocument {
	id: number;
	number: number;
	type: ItemDocumentType;
	typeLabel: string;
	occurredAt: string;
	warehouse: WarehouseRef;
	paired: PairedDocument | null;
	fiscalDocument: Ref | null;
	batch: { id: number; name: string | null } | null;
	headsTreated: number | null;
	reverses: { id: number; number: number | null } | null;
	reversedBy: { id: number; number: number | null } | null;
	canReverse: boolean;
	reversalRefusal: string | null;
	reason: string | null;
	notes: string | null;
	totalCost: string;
	createdBy: string | null;
	createdAt: string | null;
	lines: ItemDocumentLine[];
	incidentsRaised: StockIncident[];
}

export interface StockIncident {
	id: number;
	type: 'NEGATIVE_BALANCE' | 'CRITICAL_STOCK' | 'COUNT_DISCREPANCY';
	typeLabel: string;
	resolvesItself: boolean;
	item: { id: number; name: string | null };
	warehouse: { id: number; name: string | null };
	detail: string;
	status: 'OPEN' | 'RESOLVED';
	resolution: string | null;
	resolvedBy: string | null;
	resolvedAt: string | null;
	createdAt: string | null;
}

export interface Page<T> {
	data: T[];
	total: number;
	page: number;
	perPage: number;
}

export interface ItemDocumentFilters {
	type?: ItemDocumentFilterType;
	itemId?: number;
	batchId?: number;
	from?: string;
	to?: string;
	page?: number;
}

/** A line the operator loads: what, how much, in which unit or presentation. */
export interface StockLinePayload {
	item_id: number;
	input_quantity: string;
	input_unit_id: number | null;
	input_presentation_id: number | null;
	input_unit_price?: string;
}

/** A consumption: charged to one batch with the heads that received it, or to general use (D22). */
export interface ConsumptionPayload {
	/** Null: the default warehouse (DD6). */
	warehouse_id: number | null;
	occurred_at: string;
	batch_id: number | null;
	heads_treated: number | null;
	notes: string | null;
	idempotency_key: string;
	lines: StockLinePayload[];
}

/** A physical count of one item, confirmed against the balance the operator saw (DS6). */
export interface StockCountPayload {
	item_id: number;
	warehouse_id: number;
	system_quantity_seen: string;
	counted_quantity: string;
	input_unit_id: number | null;
	input_presentation_id: number | null;
	reason: string | null;
	occurred_at: string;
	idempotency_key: string;
}

export interface InitialStockPayload {
	warehouse_id: number | null;
	occurred_at: string;
	notes: string | null;
	idempotency_key: string;
	lines: StockLinePayload[];
}

/** A transfer between two active warehouses (DD7): only valued units move (DD8). */
export interface StockTransferPayload {
	from_warehouse_id: number;
	to_warehouse_id: number;
	occurred_at: string;
	notes: string | null;
	idempotency_key: string;
	lines: StockLinePayload[];
}

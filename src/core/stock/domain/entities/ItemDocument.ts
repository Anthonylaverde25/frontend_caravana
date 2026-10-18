/** Stock operations (DS14). Purchases and returns come from a provider document. */
export type ItemDocumentType = 'PURCHASE' | 'INITIAL' | 'CONSUMPTION' | 'COUNT_ADJUSTMENT' | 'RETURN_TO_PROVIDER' | 'REVERSAL';

export const ITEM_DOCUMENT_TYPES: { value: ItemDocumentType; label: string; filterLabel: string }[] = [
	{ value: 'PURCHASE', label: 'Ingreso por compra', filterLabel: 'Ingresos' },
	{ value: 'CONSUMPTION', label: 'Consumo', filterLabel: 'Consumos' },
	{ value: 'COUNT_ADJUSTMENT', label: 'Conteo', filterLabel: 'Conteos' },
	{ value: 'RETURN_TO_PROVIDER', label: 'Devolución al proveedor', filterLabel: 'Devoluciones' },
	{ value: 'INITIAL', label: 'Stock inicial', filterLabel: 'Stock inicial' },
	{ value: 'REVERSAL', label: 'Anulación', filterLabel: 'Anulaciones' }
];

export interface StockMovement {
	id: number;
	direction: 1 | -1;
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
	unitCost: string;
	totalCost: string;
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
	warehouse: { id: number; name: string | null };
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
	type?: ItemDocumentType;
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

export interface InitialStockPayload {
	occurred_at: string;
	notes: string | null;
	idempotency_key: string;
	lines: StockLinePayload[];
}

import { FiscalDocumentType } from './FiscalCatalog';

export interface FiscalTax {
	taxId: number;
	code: string;
	name: string;
	taxRateId: number | null;
	rateName: string | null;
	rate: string | null;
	taxableBase: string | null;
	amount: string;
	isRecoverable: boolean;
}

export interface FiscalDocumentLine {
	id: number;
	position: number;
	item: { id: number; code: string | null; name: string | null; unitSymbol: string | null; trackStock: boolean };
	inputQuantity: string;
	inputLabel: string | null;
	quantity: string;
	/** The four amounts are null together, only on a delivery note without prices (delivery C). */
	unitPrice: string | null;
	lineAmount: string | null;
	nonRecoverableTaxAmount: string;
	costAmount: string | null;
	unitCost: string | null;
	batch: { id: number; name: string | null } | null;
	headsTreated: number | null;
	taxes: FiscalTax[];
	/** An invoice line converted from a delivery-note line (DC5). */
	deliveryNoteLineId: number | null;
	deliveryNoteLabel: string | null;
	/** A line of a delivery note without prices: its units waiting for the invoice. */
	unvaluedLot: UnvaluedLot | null;
}

export interface UnvaluedLot {
	status: 'PENDING' | 'VALUED' | 'VOIDED';
	quantity: string;
	remainingQuantity: string;
	consumedQuantity: string;
	valuedUnitCost: string | null;
}

export type DeliveryNoteStatus = 'PENDING_INVOICE' | 'INVOICED' | 'VOIDED';

export interface DeliveryNoteRef {
	id: number;
	label: string;
	issuedAt: string;
	isValued: boolean;
}

/** A provider document as it is on paper (DS14). Amounts are positive; the type's sign says cost or credit. */
export interface FiscalDocument {
	id: number;
	label: string;
	type: FiscalDocumentType;
	/** CUIT and address: what the paper shows of its issuer. */
	provider: { id: number; name: string | null; cuit: string | null; location: string | null };
	formattedNumber: string;
	issuedAt: string;
	/** Null only on a delivery note without prices: it has no amounts at all. */
	linesAmount: string | null;
	lineTaxesAmount: string | null;
	documentTaxesAmount: string | null;
	totalAmount: string | null;
	declaredTotal: string | null;
	totalDifference: string | null;
	linesCount: number;
	status: 'REGISTERED' | 'VOIDED';
	voidReason: string | null;
	voidedAt: string | null;
	related: { id: number; label: string | null } | null;
	stockOperation: { id: number; number: number } | null;
	/** Delivery notes only (DC14). */
	isValued: boolean | null;
	deliveryNoteStatus: { code: DeliveryNoteStatus; label: string } | null;
	invoicedBy: { id: number; label: string | null } | null;
	/** An invoice converted from delivery notes. */
	deliveryNotes: DeliveryNoteRef[];
}

export interface FiscalDocumentDetail extends FiscalDocument {
	notes: string | null;
	createdBy: string | null;
	createdAt: string | null;
	lines: FiscalDocumentLine[];
	documentTaxes: FiscalTax[];
	taxSummary: { label: string; amount: string; isRecoverable: boolean }[];
	/** Differences with delivery notes (DC7). */
	discrepancies: { open: number; resolved: number; cancelled: number } | null;
}

export interface FiscalDocumentFilters {
	kind?: FiscalDocumentType['kind'];
	status?: 'REGISTERED' | 'VOIDED';
	providerId?: number;
	search?: string;
	from?: string;
	to?: string;
	page?: number;
}

export interface TaxPayload {
	tax_id: number;
	tax_rate_id?: number | null;
	rate?: string | null;
	taxable_base?: string | null;
	amount?: string | null;
}

export interface FiscalLinePayload {
	item_id: number;
	input_quantity: string;
	input_unit_id: number | null;
	input_presentation_id: number | null;
	unit_price: string | null;
	batch_id: number | null;
	heads_treated: number | null;
	taxes: TaxPayload[];
	delivery_note_line_id?: number | null;
}

export interface FiscalDocumentPayload {
	provider_id: number;
	fiscal_document_type_id: number;
	point_of_sale: number | null;
	number: number | null;
	reference: string | null;
	issued_at: string;
	declared_total: string | null;
	related_fiscal_document_id: number | null;
	notes: string | null;
	idempotency_key: string;
	lines: FiscalLinePayload[];
	document_taxes: TaxPayload[];
	/** Delivery notes only: whether the paper carries prices. */
	is_valued?: boolean | null;
	/** An invoice converted from delivery notes (DC5). */
	delivery_note_ids?: number[];
}

/** What the register adds over the page: counts per filter and the period total (signed). */
export interface FiscalRegisterSummary {
	byKind: Partial<Record<FiscalDocumentType['kind'], number>>;
	byStatus: Partial<Record<'REGISTERED' | 'VOIDED', number>>;
	totals: { count: number; net: string; taxes: string; total: string };
}

export interface FiscalRegisterPage {
	data: FiscalDocument[];
	total: number;
	page: number;
	perPage: number;
	summary: FiscalRegisterSummary | null;
}

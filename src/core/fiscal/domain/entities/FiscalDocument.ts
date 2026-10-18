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
	item: { id: number; name: string | null; unitSymbol: string | null; trackStock: boolean };
	inputQuantity: string;
	inputLabel: string | null;
	quantity: string;
	unitPrice: string;
	lineAmount: string;
	nonRecoverableTaxAmount: string;
	costAmount: string;
	unitCost: string;
	batch: { id: number; name: string | null } | null;
	headsTreated: number | null;
	taxes: FiscalTax[];
}

/** A provider document as it is on paper (DS14). Amounts are positive; the type's sign says cost or credit. */
export interface FiscalDocument {
	id: number;
	label: string;
	type: FiscalDocumentType;
	provider: { id: number; name: string | null };
	formattedNumber: string;
	issuedAt: string;
	linesAmount: string;
	lineTaxesAmount: string;
	documentTaxesAmount: string;
	totalAmount: string;
	declaredTotal: string | null;
	totalDifference: string | null;
	linesCount: number;
	status: 'REGISTERED' | 'VOIDED';
	voidReason: string | null;
	voidedAt: string | null;
	related: { id: number; label: string | null } | null;
	stockOperation: { id: number; number: number } | null;
}

export interface FiscalDocumentDetail extends FiscalDocument {
	notes: string | null;
	createdBy: string | null;
	createdAt: string | null;
	lines: FiscalDocumentLine[];
	documentTaxes: FiscalTax[];
	taxSummary: { label: string; amount: string; isRecoverable: boolean }[];
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
	unit_price: string;
	batch_id: number | null;
	heads_treated: number | null;
	taxes: TaxPayload[];
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
}

import { dec, toApi } from '@/core/stock/domain/rules/decimal';
import { inputSourcePayload } from '@/core/stock/domain/rules/lineConversion';
import { FiscalDocumentType, Tax, VAT_CODE } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { FiscalDocumentPayload, TaxPayload } from '@/core/fiscal/domain/entities/FiscalDocument';

export interface OtherTax {
	taxId: number;
	amount: string;
}

/** A row of "3. Renglones", as typed. */
export interface FiscalLineState {
	key: string;
	itemId: number | null;
	inputQuantity: string;
	/** "u:12" or "p:5" (lineConversion). */
	inputSource: string;
	unitPrice: string;
	vatRateId: number | null;
	otherTaxes: OtherTax[];
	batchId: number | null;
	batchName: string | null;
	heads: string;
	/** Converted from this delivery-note line (DC5): its item is inherited and read-only. */
	deliveryNoteLineId: number | null;
	/** The delivery note it comes from, to group the rows. */
	deliveryNoteId: number | null;
	/** The note's price, shown beside the one being copied; null when the note has none. */
	notePrice: string | null;
	/** A note line left out of the invoice: kept struck through, sent as "renglón sin facturar" (Q4). */
	removed: boolean;
}

/** A row of "4. Impuestos del comprobante". */
export interface DocumentTaxState {
	key: string;
	taxId: number | null;
	rate: string;
	taxableBase: string;
	amount: string;
}

/** "1. Comprobante". */
export interface FiscalHeaderState {
	providerId: number | null;
	typeId: number | null;
	pointOfSale: string;
	number: string;
	reference: string;
	issuedAt: string;
	declaredTotal: string;
	relatedId: number | null;
	notes: string;
	/** Delivery notes only: whether the paper carries prices (DC14); null until the operator says. */
	isValued: boolean | null;
	/** The delivery notes an invoice is converted from (DC5). */
	deliveryNoteIds: number[];
}

/** What the screen is loading: a provider document, a delivery note, or an invoice from delivery notes. */
export type EntryMode = 'document' | 'delivery-note' | 'conversion';

export const entryModeOf = (header: FiscalHeaderState, type: FiscalDocumentType | undefined): EntryMode =>
	header.deliveryNoteIds.length > 0 ? 'conversion' : type?.kind === 'DELIVERY_NOTE' ? 'delivery-note' : 'document';

let counter = 0;
export const rowKey = (): string => `row-${Date.now()}-${counter++}`;

export const emptyLine = (): FiscalLineState => ({
	key: rowKey(),
	itemId: null,
	inputQuantity: '',
	inputSource: '',
	unitPrice: '',
	vatRateId: null,
	otherTaxes: [],
	batchId: null,
	batchName: null,
	heads: '',
	deliveryNoteLineId: null,
	deliveryNoteId: null,
	notePrice: null,
	removed: false
});

export const emptyDocumentTax = (): DocumentTaxState => ({
	key: rowKey(),
	taxId: null,
	rate: '',
	taxableBase: '',
	amount: ''
});

export const isBlankLine = (line: FiscalLineState): boolean =>
	!line.itemId && !line.inputQuantity.trim() && !line.unitPrice.trim();

/** What the operator typed, normalised to the API's decimals; an unreadable value goes as typed so the backend marks its cell. */
const decimal = (value: string, scale: number): string => {
	const parsed = dec(value);
	return parsed === null ? value.trim() : toApi(parsed, scale);
};
const optionalDecimal = (value: string, scale: number): string | null =>
	value.trim() === '' ? null : decimal(value, scale);

export interface BuiltPayload {
	payload: FiscalDocumentPayload;
	/** Row key of each sent line, by its index in the request (to place the backend's errors). */
	lineKeys: string[];
	documentTaxKeys: string[];
}

export function buildPayload(
	header: FiscalHeaderState,
	lines: FiscalLineState[],
	documentTaxes: DocumentTaxState[],
	type: FiscalDocumentType | undefined,
	taxes: Tax[],
	idempotencyKey: string
): BuiltPayload {
	const vat = taxes.find((t) => t.code === VAT_CODE);
	const discriminates = !!type?.discriminatesVat;
	const mode = entryModeOf(header, type);
	const unpriced = mode === 'delivery-note' && header.isValued === false;
	const sent = lines.filter((l) => !isBlankLine(l) && !l.removed);
	const sentTaxes = discriminates ? documentTaxes.filter((t) => t.taxId !== null) : [];

	const lineTaxes = (line: FiscalLineState): TaxPayload[] => {
		if (!discriminates) return [];

		const result: TaxPayload[] = vat && line.vatRateId ? [{ tax_id: vat.id, tax_rate_id: line.vatRateId }] : [];
		return result.concat(line.otherTaxes.map((t) => ({ tax_id: t.taxId, amount: optionalDecimal(t.amount, 4) })));
	};

	return {
		lineKeys: sent.map((l) => l.key),
		documentTaxKeys: sentTaxes.map((t) => t.key),
		payload: {
			provider_id: header.providerId ?? 0,
			fiscal_document_type_id: header.typeId ?? 0,
			point_of_sale: type?.requiresNumber && header.pointOfSale ? Number(header.pointOfSale) : null,
			number: type?.requiresNumber && header.number ? Number(header.number) : null,
			reference: type?.requiresNumber ? null : header.reference.trim() || null,
			issued_at: header.issuedAt,
			declared_total: mode === 'delivery-note' ? null : optionalDecimal(header.declaredTotal, 4),
			related_fiscal_document_id: type?.kind === 'CREDIT_NOTE' ? header.relatedId : null,
			notes: header.notes.trim() || null,
			idempotency_key: idempotencyKey,
			is_valued: mode === 'delivery-note' ? header.isValued : null,
			...(mode === 'conversion' ? { delivery_note_ids: header.deliveryNoteIds } : {}),
			lines: sent.map((line) => ({
				item_id: line.itemId ?? 0,
				input_quantity: decimal(line.inputQuantity, 4),
				...inputSourcePayload(line.inputSource),
				unit_price: unpriced ? null : decimal(line.unitPrice, 6),
				batch_id: line.batchId,
				heads_treated: line.batchId && line.heads ? Number(line.heads) : null,
				taxes: lineTaxes(line),
				delivery_note_line_id: line.deliveryNoteLineId
			})),
			document_taxes: sentTaxes.map((t) => ({
				tax_id: t.taxId as number,
				rate: optionalDecimal(t.rate, 4),
				taxable_base: optionalDecimal(t.taxableBase, 4),
				amount: optionalDecimal(t.amount, 4)
			}))
		}
	};
}

/** Which cell of a row a backend field belongs to: "taxes.1.amount" → "otherTaxes", "taxes.0.tax_rate_id" → "vat". */
export function cellOf(field: string): string {
	if (field.startsWith('taxes'))
		return /taxes\.\d+\.(amount|tax_id)$/.test(field) && !field.endsWith('.0.tax_id') ? 'otherTaxes' : 'vat';

	if (field === 'input_presentation_id') return 'input_unit_id';

	if (field === 'heads_treated') return 'batch_id';

	return field;
}

import { FiscalDocumentType, Tax } from '../../domain/entities/FiscalCatalog';
import { FiscalDocument, FiscalDocumentDetail, FiscalTax } from '../../domain/entities/FiscalDocument';

const tax = (raw: any): FiscalTax => ({
	taxId: raw.tax_id,
	code: raw.code,
	name: raw.name,
	taxRateId: raw.tax_rate_id ?? null,
	rateName: raw.rate_name ?? null,
	rate: raw.rate ?? null,
	taxableBase: raw.taxable_base ?? null,
	amount: raw.amount,
	isRecoverable: !!raw.is_recoverable
});

export const FiscalMapper = {
	type(raw: any): FiscalDocumentType {
		return {
			id: raw.id,
			code: raw.code,
			name: raw.name,
			kind: raw.kind,
			letter: raw.letter ?? null,
			discriminatesVat: !!raw.discriminates_vat,
			sign: raw.sign,
			requiresNumber: !!raw.requires_number
		};
	},

	tax(raw: any): Tax {
		return {
			id: raw.id,
			code: raw.code,
			name: raw.name,
			kind: raw.kind,
			jurisdiction: raw.jurisdiction,
			appliesTo: raw.applies_to,
			isRecoverable: !!raw.is_recoverable,
			rates: (raw.rates ?? []).map((r: any) => ({ id: r.id, code: r.code, name: r.name, rate: r.rate }))
		};
	},

	document(raw: any): FiscalDocument {
		return {
			id: raw.id,
			label: raw.label,
			type: FiscalMapper.type(raw.type),
			provider: { id: raw.provider?.id, name: raw.provider?.name ?? null },
			formattedNumber: raw.formatted_number,
			issuedAt: raw.issued_at,
			linesAmount: raw.lines_amount,
			lineTaxesAmount: raw.line_taxes_amount,
			documentTaxesAmount: raw.document_taxes_amount,
			totalAmount: raw.total_amount,
			declaredTotal: raw.declared_total ?? null,
			totalDifference: raw.total_difference ?? null,
			linesCount: raw.lines_count ?? 0,
			status: raw.status,
			voidReason: raw.void_reason ?? null,
			voidedAt: raw.voided_at ?? null,
			related: raw.related ?? null,
			stockOperation: raw.stock_operation ?? null,
			isValued: raw.is_valued ?? null,
			deliveryNoteStatus: raw.delivery_note_status ?? null,
			invoicedBy: raw.invoiced_by ?? null,
			deliveryNotes: (raw.delivery_notes ?? []).map((n: any) => ({
				id: n.id,
				label: n.label,
				issuedAt: n.issued_at,
				isValued: !!n.is_valued
			}))
		};
	},

	detail(raw: any): FiscalDocumentDetail {
		return {
			...FiscalMapper.document(raw),
			notes: raw.notes ?? null,
			createdBy: raw.created_by ?? null,
			createdAt: raw.created_at ?? null,
			lines: (raw.lines ?? []).map((l: any) => ({
				id: l.id,
				position: l.position,
				item: {
					id: l.item.id,
					name: l.item.name ?? null,
					unitSymbol: l.item.unit_symbol ?? null,
					trackStock: !!l.item.track_stock
				},
				inputQuantity: l.input_quantity,
				inputLabel: l.input_label ?? null,
				quantity: l.quantity,
				unitPrice: l.unit_price ?? null,
				lineAmount: l.line_amount ?? null,
				nonRecoverableTaxAmount: l.non_recoverable_tax_amount,
				costAmount: l.cost_amount ?? null,
				unitCost: l.unit_cost ?? null,
				batch: l.batch ?? null,
				headsTreated: l.heads_treated ?? null,
				taxes: (l.taxes ?? []).map(tax),
				deliveryNoteLineId: l.delivery_note_line_id ?? null,
				deliveryNoteLabel: l.delivery_note_label ?? null,
				unvaluedLot: l.unvalued_lot
					? {
							status: l.unvalued_lot.status,
							quantity: l.unvalued_lot.quantity,
							remainingQuantity: l.unvalued_lot.remaining_quantity,
							consumedQuantity: l.unvalued_lot.consumed_quantity,
							valuedUnitCost: l.unvalued_lot.valued_unit_cost ?? null
						}
					: null
			})),
			documentTaxes: (raw.document_taxes ?? []).map(tax),
			taxSummary: (raw.tax_summary ?? []).map((s: any) => ({
				label: s.label,
				amount: s.amount,
				isRecoverable: !!s.is_recoverable
			})),
			discrepancies: raw.discrepancies ?? null
		};
	}
};

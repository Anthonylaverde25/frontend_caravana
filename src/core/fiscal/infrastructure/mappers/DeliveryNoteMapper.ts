import { FiscalDiscrepancy, InvoiceDraft, PendingDeliveryNote } from '../../domain/entities/DeliveryNote';

export const DeliveryNoteMapper = {
	pending(raw: any): PendingDeliveryNote {
		return {
			id: raw.id,
			label: raw.label,
			providerId: raw.provider_id,
			providerName: raw.provider_name ?? null,
			issuedAt: raw.issued_at,
			ageDays: raw.age_days ?? 0,
			isValued: !!raw.is_valued,
			linesCount: raw.lines_count ?? 0,
			linesAmount: raw.lines_amount ?? null,
			unvaluedPending: raw.unvalued_pending ?? null,
			unvaluedIssued: raw.unvalued_issued ?? null,
			linesWithIssues: raw.lines_with_issues ?? 0
		};
	},

	draft(raw: any): InvoiceDraft {
		return {
			provider: { id: raw.provider.id, name: raw.provider.name ?? null },
			deliveryNotes: (raw.delivery_notes ?? []).map((n: any) => ({
				id: n.id,
				label: n.label,
				issuedAt: n.issued_at,
				isValued: !!n.is_valued,
				lines: (n.lines ?? []).map((l: any) => ({
					deliveryNoteLineId: l.delivery_note_line_id,
					position: l.position,
					item: { id: l.item.id, name: l.item.name ?? null, unitSymbol: l.item.unit_symbol ?? null },
					inputQuantity: l.input_quantity,
					inputUnitId: l.input_unit_id ?? null,
					inputPresentationId: l.input_presentation_id ?? null,
					inputLabel: l.input_label ?? null,
					quantity: l.quantity,
					unitPrice: l.unit_price ?? null
				}))
			}))
		};
	},

	discrepancy(raw: any): FiscalDiscrepancy {
		return {
			id: raw.id,
			type: raw.type,
			typeLabel: raw.type_label,
			status: raw.status,
			invoice: raw.invoice,
			deliveryNote: raw.delivery_note ?? null,
			item: raw.item ?? null,
			expectedValue: raw.expected_value ?? null,
			actualValue: raw.actual_value ?? null,
			detail: raw.detail,
			resolution: raw.resolution ?? null,
			resolvedBy: raw.resolved_by ?? null,
			resolvedAt: raw.resolved_at ?? null,
			createdAt: raw.created_at ?? null
		};
	}
};

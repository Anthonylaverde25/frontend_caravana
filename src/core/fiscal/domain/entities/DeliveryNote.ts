/**
 * Delivery C: what arrived with a delivery note and has no invoice yet, what its invoice inherits,
 * and every difference between both papers.
 */

/** A row of "Remitos a facturar" (DC12). */
export interface PendingDeliveryNote {
	id: number;
	label: string;
	providerId: number;
	providerName: string | null;
	issuedAt: string;
	ageDays: number;
	isValued: boolean;
	linesCount: number;
	linesAmount: string | null;
	/** Units still waiting for the invoice, and how many of the note already left; null when priced. */
	unvaluedPending: string | null;
	unvaluedIssued: string | null;
	linesWithIssues: number;
}

export interface InvoiceDraftLine {
	deliveryNoteLineId: number;
	position: number;
	item: { id: number; name: string | null; unitSymbol: string | null };
	inputQuantity: string;
	inputUnitId: number | null;
	inputPresentationId: number | null;
	inputLabel: string | null;
	quantity: string;
	unitPrice: string | null;
}

/** What "Convertir a factura" inherits from the delivery notes (DC5); saved nothing. */
export interface InvoiceDraft {
	provider: { id: number; name: string | null };
	deliveryNotes: { id: number; label: string; issuedAt: string; isValued: boolean; lines: InvoiceDraftLine[] }[];
}

export type DiscrepancyType = 'QUANTITY' | 'PRICE' | 'MISSING_LINE' | 'EXTRA_LINE' | 'TOTAL';
export type DiscrepancyStatus = 'OPEN' | 'RESOLVED' | 'CANCELLED';

/** A difference between a delivery note and its invoice (DC7), settled with the provider (DC8). */
export interface FiscalDiscrepancy {
	id: number;
	type: DiscrepancyType;
	typeLabel: string;
	status: DiscrepancyStatus;
	invoice: { id: number; label: string | null };
	deliveryNote: { id: number; label: string | null } | null;
	item: { id: number; name: string | null } | null;
	expectedValue: string | null;
	actualValue: string | null;
	detail: string;
	resolution: string | null;
	resolvedBy: string | null;
	resolvedAt: string | null;
	createdAt: string | null;
}

export interface DiscrepancyFilters {
	status?: DiscrepancyStatus;
	invoiceId?: number;
	deliveryNoteId?: number;
	providerId?: number;
}

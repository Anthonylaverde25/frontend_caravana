import { DiscrepancyFilters, FiscalDiscrepancy, InvoiceDraft, PendingDeliveryNote } from '../entities/DeliveryNote';

export interface IDeliveryNoteRepository {
	pending(providerId?: number): Promise<PendingDeliveryNote[]>;
	invoiceDraft(ids: number[]): Promise<InvoiceDraft>;
	discrepancies(filters: DiscrepancyFilters): Promise<FiscalDiscrepancy[]>;
	resolveDiscrepancy(id: number, resolution: string): Promise<FiscalDiscrepancy>;
}

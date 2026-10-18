import {
	DiscrepancyFilters,
	FiscalDiscrepancy,
	InvoiceDraft,
	PendingDeliveryNote
} from '../../domain/entities/DeliveryNote';
import { IDeliveryNoteRepository } from '../../domain/repositories/IDeliveryNoteRepository';

/** "Remitos a facturar" (DC12); with a provider, the notice of a direct invoice (DC9). */
export class ListPendingDeliveryNotesUseCase {
	constructor(private repository: IDeliveryNoteRepository) {}

	execute(providerId?: number): Promise<PendingDeliveryNote[]> {
		return this.repository.pending(providerId);
	}
}

/** "Convertir a factura": what the invoice inherits from its delivery notes (DC5). */
export class BuildInvoiceDraftUseCase {
	constructor(private repository: IDeliveryNoteRepository) {}

	execute(ids: number[]): Promise<InvoiceDraft> {
		return this.repository.invoiceDraft(ids);
	}
}

export class ListFiscalDiscrepanciesUseCase {
	constructor(private repository: IDeliveryNoteRepository) {}

	execute(filters: DiscrepancyFilters): Promise<FiscalDiscrepancy[]> {
		return this.repository.discrepancies(filters);
	}
}

/** Closed by hand with how it was settled with the provider (DC8); nothing changes in stock. */
export class ResolveFiscalDiscrepancyUseCase {
	constructor(private repository: IDeliveryNoteRepository) {}

	execute(id: number, resolution: string): Promise<FiscalDiscrepancy> {
		return this.repository.resolveDiscrepancy(id, resolution.trim());
	}
}

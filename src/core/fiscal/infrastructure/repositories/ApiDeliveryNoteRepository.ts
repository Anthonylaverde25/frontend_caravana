import axiosInstance from '@/utils/axios';
import {
	DiscrepancyFilters,
	FiscalDiscrepancy,
	InvoiceDraft,
	PendingDeliveryNote
} from '../../domain/entities/DeliveryNote';
import { IDeliveryNoteRepository } from '../../domain/repositories/IDeliveryNoteRepository';
import { DeliveryNoteMapper } from '../mappers/DeliveryNoteMapper';

export class ApiDeliveryNoteRepository implements IDeliveryNoteRepository {
	async pending(providerId?: number): Promise<PendingDeliveryNote[]> {
		const response = await axiosInstance.get<any>('/delivery-notes/pending', {
			params: { provider_id: providerId }
		});
		return (response.data.data ?? []).map(DeliveryNoteMapper.pending);
	}

	async invoiceDraft(ids: number[]): Promise<InvoiceDraft> {
		const response = await axiosInstance.get<any>('/delivery-notes/invoice-draft', { params: { ids } });
		return DeliveryNoteMapper.draft(response.data);
	}

	async discrepancies(filters: DiscrepancyFilters): Promise<FiscalDiscrepancy[]> {
		const response = await axiosInstance.get<any[]>('/fiscal-discrepancies', {
			params: {
				status: filters.status,
				invoice_id: filters.invoiceId,
				delivery_note_id: filters.deliveryNoteId,
				provider_id: filters.providerId
			}
		});
		return response.data.map(DeliveryNoteMapper.discrepancy);
	}

	async resolveDiscrepancy(id: number, resolution: string): Promise<FiscalDiscrepancy> {
		const response = await axiosInstance.patch<any>(`/fiscal-discrepancies/${id}/resolve`, { resolution });
		return DeliveryNoteMapper.discrepancy(response.data);
	}
}

import axiosInstance from '@/utils/axios';
import { ConsumptionPayload, InitialStockPayload, ItemDocument, ItemDocumentFilters, Page, StockCountPayload } from '../../domain/entities/ItemDocument';
import { IItemDocumentRepository } from '../../domain/repositories/IItemDocumentRepository';
import { StockMapper } from '../mappers/StockMapper';

export class ApiItemDocumentRepository implements IItemDocumentRepository {
	async search(filters: ItemDocumentFilters): Promise<Page<ItemDocument>> {
		const response = await axiosInstance.get<any>('/item-documents', {
			params: { type: filters.type, item_id: filters.itemId, batch_id: filters.batchId, from: filters.from, to: filters.to, page: filters.page }
		});
		return StockMapper.page(response.data, StockMapper.document);
	}

	async findById(id: number): Promise<ItemDocument> {
		const response = await axiosInstance.get<any>(`/item-documents/${id}`);
		return StockMapper.document(response.data);
	}

	async registerInitialStock(payload: InitialStockPayload): Promise<ItemDocument> {
		const response = await axiosInstance.post<any>('/item-documents/initial-stock', payload);
		return StockMapper.document(response.data);
	}

	async registerConsumption(payload: ConsumptionPayload): Promise<ItemDocument> {
		const response = await axiosInstance.post<any>('/item-documents/consumptions', payload);
		return StockMapper.document(response.data);
	}

	async registerCount(payload: StockCountPayload): Promise<ItemDocument> {
		const response = await axiosInstance.post<any>('/item-documents/counts', payload);
		return StockMapper.document(response.data);
	}

	async reverse(id: number, reason: string, idempotencyKey: string): Promise<ItemDocument> {
		const response = await axiosInstance.post<any>(`/item-documents/${id}/reversal`, { reason, idempotency_key: idempotencyKey });
		return StockMapper.document(response.data);
	}
}

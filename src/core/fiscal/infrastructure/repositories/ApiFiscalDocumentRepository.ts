import axiosInstance from '@/utils/axios';
import { Page } from '@/core/stock/domain/entities/ItemDocument';
import { StockMapper } from '@/core/stock/infrastructure/mappers/StockMapper';
import { FiscalDocumentType, Tax } from '../../domain/entities/FiscalCatalog';
import { FiscalDocument, FiscalDocumentDetail, FiscalDocumentFilters, FiscalDocumentPayload } from '../../domain/entities/FiscalDocument';
import { IFiscalCatalogRepository, IFiscalDocumentRepository } from '../../domain/repositories/IFiscalDocumentRepository';
import { FiscalMapper } from '../mappers/FiscalMapper';

export class ApiFiscalDocumentRepository implements IFiscalDocumentRepository {
	async search(filters: FiscalDocumentFilters): Promise<Page<FiscalDocument>> {
		const response = await axiosInstance.get<any>('/fiscal-documents', {
			params: {
				kind: filters.kind,
				status: filters.status,
				provider_id: filters.providerId,
				search: filters.search || undefined,
				from: filters.from,
				to: filters.to,
				page: filters.page
			}
		});
		return StockMapper.page(response.data, FiscalMapper.document);
	}

	async findById(id: number): Promise<FiscalDocumentDetail> {
		const response = await axiosInstance.get<any>(`/fiscal-documents/${id}`);
		return FiscalMapper.detail(response.data);
	}

	async register(payload: FiscalDocumentPayload): Promise<FiscalDocumentDetail> {
		const response = await axiosInstance.post<any>('/fiscal-documents', payload);
		return FiscalMapper.detail(response.data);
	}

	async void(id: number, reason: string): Promise<FiscalDocumentDetail> {
		const response = await axiosInstance.post<any>(`/fiscal-documents/${id}/void`, { reason });
		return FiscalMapper.detail(response.data);
	}
}

export class ApiFiscalCatalogRepository implements IFiscalCatalogRepository {
	async documentTypes(): Promise<FiscalDocumentType[]> {
		const response = await axiosInstance.get<any[]>('/fiscal-document-types');
		return response.data.map(FiscalMapper.type);
	}

	async taxes(date?: string): Promise<Tax[]> {
		const response = await axiosInstance.get<any[]>('/taxes', { params: { date } });
		return response.data.map(FiscalMapper.tax);
	}
}

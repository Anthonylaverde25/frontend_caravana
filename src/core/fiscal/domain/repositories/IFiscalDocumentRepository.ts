import { FiscalDocumentType, Tax } from '../entities/FiscalCatalog';
import { FiscalDocumentDetail, FiscalDocumentFilters, FiscalDocumentPayload, FiscalRegisterPage } from '../entities/FiscalDocument';

export interface IFiscalDocumentRepository {
	search(filters: FiscalDocumentFilters): Promise<FiscalRegisterPage>;
	findById(id: number): Promise<FiscalDocumentDetail>;
	register(payload: FiscalDocumentPayload): Promise<FiscalDocumentDetail>;
	void(id: number, reason: string): Promise<FiscalDocumentDetail>;
}

/** Read-only: types, taxes and rates change only with the law (DS15). */
export interface IFiscalCatalogRepository {
	documentTypes(): Promise<FiscalDocumentType[]>;
	taxes(date?: string): Promise<Tax[]>;
}

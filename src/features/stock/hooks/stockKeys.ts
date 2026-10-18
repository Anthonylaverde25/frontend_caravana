import { ItemDocumentFilters } from '@/core/stock/domain/entities/ItemDocument';
import { KardexFilters } from '@/core/stock/domain/entities/ItemStock';
import { FiscalDocumentFilters } from '@/core/fiscal/domain/entities/FiscalDocument';
import { DiscrepancyFilters } from '@/core/fiscal/domain/entities/DeliveryNote';

/**
 * Every key carries the company, so one company's ledger is never shown in another. Item stock and
 * kardex hang from the 'items' prefix: invalidating the catalog refreshes them too.
 */
export const stockKeys = {
	fiscalCatalog: () => ['fiscal-catalog'] as const,
	fiscalDocuments: (companyId: number | null) => ['fiscal-documents', companyId] as const,
	fiscalList: (companyId: number | null, filters: FiscalDocumentFilters) =>
		['fiscal-documents', companyId, 'list', filters] as const,
	fiscalDetail: (companyId: number | null, id: number) => ['fiscal-documents', companyId, 'detail', id] as const,
	documents: (companyId: number | null) => ['item-documents', companyId] as const,
	documentList: (companyId: number | null, filters: ItemDocumentFilters) =>
		['item-documents', companyId, 'list', filters] as const,
	document: (companyId: number | null, id: number) => ['item-documents', companyId, 'detail', id] as const,
	itemStock: (companyId: number | null, itemId: number) => ['items', companyId, 'stock', itemId] as const,
	kardex: (companyId: number | null, itemId: number, filters: KardexFilters) =>
		['items', companyId, 'kardex', itemId, filters] as const,
	incidents: (companyId: number | null) => ['stock-incidents', companyId] as const,
	warehouses: (companyId: number | null) => ['warehouses', companyId] as const,
	pendingDeliveryNotes: (companyId: number | null, providerId?: number) =>
		['delivery-notes', companyId, 'pending', providerId ?? null] as const,
	invoiceDraft: (companyId: number | null, ids: number[]) => ['delivery-notes', companyId, 'draft', ids] as const,
	discrepancies: (companyId: number | null, filters: DiscrepancyFilters) =>
		['fiscal-discrepancies', companyId, filters] as const
};

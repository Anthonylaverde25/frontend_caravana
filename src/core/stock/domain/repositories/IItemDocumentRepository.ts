import { InitialStockPayload, ItemDocument, ItemDocumentFilters, Page } from '../entities/ItemDocument';

export interface IItemDocumentRepository {
	search(filters: ItemDocumentFilters): Promise<Page<ItemDocument>>;
	findById(id: number): Promise<ItemDocument>;
	registerInitialStock(payload: InitialStockPayload): Promise<ItemDocument>;
	reverse(id: number, reason: string, idempotencyKey: string): Promise<ItemDocument>;
}

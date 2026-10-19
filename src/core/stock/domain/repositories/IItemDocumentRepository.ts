import { ConsumptionPayload, InitialStockPayload, ItemDocument, ItemDocumentFilters, Page, StockCountPayload, StockTransferPayload } from '../entities/ItemDocument';

export interface IItemDocumentRepository {
	search(filters: ItemDocumentFilters): Promise<Page<ItemDocument>>;
	findById(id: number): Promise<ItemDocument>;
	registerInitialStock(payload: InitialStockPayload): Promise<ItemDocument>;
	registerConsumption(payload: ConsumptionPayload): Promise<ItemDocument>;
	registerCount(payload: StockCountPayload): Promise<ItemDocument>;
	/** Answers with the exit; its `paired` is the entry. */
	registerTransfer(payload: StockTransferPayload): Promise<ItemDocument>;
	reverse(id: number, reason: string, idempotencyKey: string): Promise<ItemDocument>;
}

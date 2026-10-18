import { InitialStockPayload, ItemDocument, ItemDocumentFilters, Page } from '../../domain/entities/ItemDocument';
import { ItemStockView, KardexFilters, KardexRow } from '../../domain/entities/ItemStock';
import { IItemDocumentRepository } from '../../domain/repositories/IItemDocumentRepository';
import { IItemStockRepository } from '../../domain/repositories/IItemStockRepository';

export class SearchItemDocumentsUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(filters: ItemDocumentFilters): Promise<Page<ItemDocument>> {
		return this.repository.search(filters);
	}
}

export class FindItemDocumentUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(id: number): Promise<ItemDocument> {
		return this.repository.findById(id);
	}
}

export class RegisterInitialStockUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(payload: InitialStockPayload): Promise<ItemDocument> {
		return this.repository.registerInitialStock(payload);
	}
}

/** Initial stock, consumption or count; purchases are reversed by voiding their document. */
export class ReverseItemDocumentUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(id: number, reason: string, idempotencyKey: string): Promise<ItemDocument> {
		return this.repository.reverse(id, reason.trim(), idempotencyKey);
	}
}

export class GetItemStockUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(itemId: number): Promise<ItemStockView> {
		return this.repository.findByItem(itemId);
	}
}

export class GetItemKardexUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(itemId: number, filters: KardexFilters): Promise<Page<KardexRow>> {
		return this.repository.kardex(itemId, filters);
	}
}

/** An empty level clears the critical-stock control (D19). */
export class SetCriticalStockUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(itemId: number, warehouseId: number, level: string | null): Promise<ItemStockView> {
		return this.repository.setCriticalStock(itemId, warehouseId, level?.trim() ? level.trim() : null);
	}
}

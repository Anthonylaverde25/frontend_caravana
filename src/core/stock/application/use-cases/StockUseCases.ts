import { ConsumptionPayload, InitialStockPayload, ItemDocument, ItemDocumentFilters, Page, StockCountPayload, StockIncident, StockTransferPayload } from '../../domain/entities/ItemDocument';
import { BatchConsumptionHistory, ItemStockView, KardexFilters, KardexRow, Warehouse } from '../../domain/entities/ItemStock';
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

/** Stock-tracked articles leave at the average; a negative balance is recorded and raises a notice (D5). */
export class RegisterConsumptionUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(payload: ConsumptionPayload): Promise<ItemDocument> {
		return this.repository.registerConsumption(payload);
	}
}

/** Answers 409 when the balance changed since the operator saw it (DS6). */
export class RegisterStockCountUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(payload: StockCountPayload): Promise<ItemDocument> {
		return this.repository.registerCount(payload);
	}
}

/** Only valued units move and the origin never goes below zero (DD8): the backend answers per line. */
export class RegisterStockTransferUseCase {
	constructor(private repository: IItemDocumentRepository) {}

	execute(payload: StockTransferPayload): Promise<ItemDocument> {
		return this.repository.registerTransfer(payload);
	}
}

export class ListWarehousesUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(): Promise<Warehouse[]> {
		return this.repository.warehouses();
	}
}

/** Code and name, unique per company (DD1); the backend answers each field. */
export class SaveWarehouseUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(id: number | null, code: string, name: string): Promise<Warehouse> {
		return id === null ? this.repository.createWarehouse(code.trim(), name.trim()) : this.repository.updateWarehouse(id, code.trim(), name.trim());
	}
}

export class SetDefaultWarehouseUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(id: number): Promise<Warehouse[]> {
		return this.repository.setDefaultWarehouse(id);
	}
}

/** Never refused for what it holds (DD4); the default leaves only naming the next one (DD3). */
export class SetWarehouseActiveUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(id: number, active: boolean, newDefaultId: number | null = null): Promise<Warehouse[]> {
		return this.repository.setWarehouseActive(id, active, newDefaultId);
	}
}

/** Only a count discrepancy is resolved by hand; the other notices resolve themselves. */
export class ResolveStockIncidentUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(id: number, resolution: string): Promise<StockIncident> {
		return this.repository.resolveIncident(id, resolution.trim());
	}
}

export class GetBatchConsumptionHistoryUseCase {
	constructor(private repository: IItemStockRepository) {}

	execute(batchId: number): Promise<BatchConsumptionHistory> {
		return this.repository.batchHistory(batchId);
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

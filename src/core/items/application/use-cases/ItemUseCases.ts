import { Item, ItemDetail, ItemFilters, ItemPayload, ItemPresentation } from '../../domain/entities/Item';
import { IItemRepository, ProviderLinkPayload } from '../../domain/repositories/IItemRepository';

export class SearchItemsUseCase {
	constructor(private repository: IItemRepository) {}

	execute(filters: ItemFilters): Promise<Item[]> {
		return this.repository.search(filters);
	}
}

export class FindItemUseCase {
	constructor(private repository: IItemRepository) {}

	execute(id: number): Promise<ItemDetail> {
		return this.repository.findById(id);
	}
}

export class SaveItemUseCase {
	constructor(private repository: IItemRepository) {}

	/** Without an id it creates; an empty code lets the backend assign the next one. */
	execute(payload: ItemPayload, id?: number): Promise<ItemDetail> {
		const body = { ...payload, code: payload.code?.trim() ? payload.code.trim().toUpperCase() : null };
		return id ? this.repository.update(id, body) : this.repository.create(body);
	}
}

export class SetItemActiveUseCase {
	constructor(private repository: IItemRepository) {}

	execute(id: number, active: boolean): Promise<ItemDetail> {
		return this.repository.setActive(id, active);
	}
}

export class SaveItemPresentationUseCase {
	constructor(private repository: IItemRepository) {}

	execute(itemId: number, name: string, factor: number, presentationId?: number): Promise<ItemPresentation> {
		return presentationId
			? this.repository.updatePresentation(itemId, presentationId, name.trim(), factor)
			: this.repository.addPresentation(itemId, name.trim(), factor);
	}
}

export class SetItemPresentationActiveUseCase {
	constructor(private repository: IItemRepository) {}

	execute(itemId: number, presentationId: number, active: boolean): Promise<ItemPresentation> {
		return this.repository.setPresentationActive(itemId, presentationId, active);
	}
}

export class SyncItemProvidersUseCase {
	constructor(private repository: IItemRepository) {}

	execute(itemId: number, links: ProviderLinkPayload[]): Promise<ItemDetail> {
		return this.repository.syncProviders(itemId, links);
	}
}

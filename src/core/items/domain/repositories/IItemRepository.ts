import { Item, ItemDetail, ItemFilters, ItemPayload, ItemPresentation } from '../entities/Item';

export interface ProviderLinkPayload {
	provider_id: number;
	lead_time_days: number | null;
	is_preferred: boolean;
}

export interface IItemRepository {
	search(filters: ItemFilters): Promise<Item[]>;
	findById(id: number): Promise<ItemDetail>;
	create(payload: ItemPayload): Promise<ItemDetail>;
	update(id: number, payload: Partial<ItemPayload>): Promise<ItemDetail>;
	setActive(id: number, active: boolean): Promise<ItemDetail>;
	addPresentation(itemId: number, name: string, factor: number): Promise<ItemPresentation>;
	updatePresentation(itemId: number, presentationId: number, name: string, factor: number): Promise<ItemPresentation>;
	setPresentationActive(itemId: number, presentationId: number, active: boolean): Promise<ItemPresentation>;
	/** The full list replaces the item's providers. */
	syncProviders(itemId: number, links: ProviderLinkPayload[]): Promise<ItemDetail>;
}

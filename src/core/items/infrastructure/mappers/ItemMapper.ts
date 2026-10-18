import { Item, ItemDetail, ItemPresentation, ItemProviderLink } from '../../domain/entities/Item';

export const ItemMapper = {
	toDomain(raw: any): Item {
		return {
			id: raw.id,
			code: raw.code,
			name: raw.name,
			description: raw.description ?? null,
			type: raw.type,
			trackStock: !!raw.track_stock,
			behavior: raw.behavior,
			isActive: !!raw.is_active,
			unit: raw.unit
				? { id: raw.unit.id, code: raw.unit.code, symbol: raw.unit.symbol, name: raw.unit.name, isConvertible: !!raw.unit.is_convertible }
				: null,
			category: raw.category ? { id: raw.category.id, name: raw.category.name, path: raw.category.path ?? raw.category.name } : null,
			presentationsCount: raw.presentations_count ?? 0,
			providersCount: raw.providers_count ?? 0
		};
	},

	toDetail(raw: any): ItemDetail {
		return {
			...ItemMapper.toDomain(raw),
			presentations: (raw.presentations ?? []).map(ItemMapper.presentationToDomain),
			providers: (raw.providers ?? []).map(
				(p: any): ItemProviderLink => ({
					providerId: p.provider_id,
					name: p.name ?? '',
					cuit: p.cuit ?? '',
					leadTimeDays: p.lead_time_days ?? null,
					isPreferred: !!p.is_preferred
				})
			)
		};
	},

	presentationToDomain(raw: any): ItemPresentation {
		return {
			id: raw.id,
			itemId: raw.item_id,
			name: raw.name,
			factorToItemUnit: Number(raw.factor_to_item_unit),
			isActive: !!raw.is_active
		};
	}
};

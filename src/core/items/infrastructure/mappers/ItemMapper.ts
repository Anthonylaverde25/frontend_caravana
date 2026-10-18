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
				? {
						id: raw.unit.id,
						code: raw.unit.code,
						symbol: raw.unit.symbol,
						name: raw.unit.name,
						isConvertible: !!raw.unit.is_convertible
					}
				: null,
			category: raw.category
				? { id: raw.category.id, name: raw.category.name, path: raw.category.path ?? raw.category.name }
				: null,
			presentationsCount: raw.presentations_count ?? 0,
			providersCount: raw.providers_count ?? 0,
			stock: raw.stock
				? {
						quantity: raw.stock.quantity,
						unvaluedQuantity: raw.stock.unvalued_quantity ?? '0.0000',
						value: raw.stock.value,
						hasNegative: !!raw.stock.has_negative,
						hasCritical: !!raw.stock.has_critical
					}
				: null,
			lastVatRateId: raw.last_vat_rate_id ?? null
		};
	},

	toDetail(raw: any): ItemDetail {
		return {
			...ItemMapper.toDomain(raw),
			hasMovements: !!raw.has_movements,
			presentations: (raw.presentations ?? []).map(ItemMapper.presentationToDomain),
			providers: (raw.providers ?? []).map(
				(p: any): ItemProviderLink => ({
					providerId: p.provider_id,
					name: p.name ?? '',
					cuit: p.cuit ?? '',
					leadTimeDays: p.lead_time_days ?? null,
					isPreferred: !!p.is_preferred,
					lastPurchase: p.last_purchase
						? {
								fiscalDocumentId: p.last_purchase.fiscal_document_id,
								label: p.last_purchase.label,
								issuedAt: p.last_purchase.issued_at,
								unitPrice: p.last_purchase.unit_price,
								inputLabel: p.last_purchase.input_label
							}
						: null
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

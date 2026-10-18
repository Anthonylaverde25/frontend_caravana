import { UnitOfMeasure } from '../../domain/entities/UnitOfMeasure';

/** Decimals travel as strings (Laravel decimal cast); the screen works with numbers. */
export const UnitOfMeasureMapper = {
	toDomain(raw: any): UnitOfMeasure {
		return {
			id: raw.id,
			code: raw.code,
			name: raw.name,
			symbol: raw.symbol,
			dimension: raw.dimension,
			dimensionLabel: raw.dimension_label,
			factorToBase: raw.factor_to_base === null || raw.factor_to_base === undefined ? null : Number(raw.factor_to_base),
			isBase: !!raw.is_base,
			isConvertible: !!raw.is_convertible,
			isActive: !!raw.is_active,
			displayOrder: raw.display_order ?? 0,
			itemsCount: raw.items_count ?? 0
		};
	}
};

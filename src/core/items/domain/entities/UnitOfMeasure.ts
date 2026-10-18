export type UnitDimension = 'MASS' | 'VOLUME' | 'COUNT' | 'TIME' | 'AREA' | 'LENGTH';

export const UNIT_DIMENSIONS: { value: UnitDimension; label: string }[] = [
	{ value: 'MASS', label: 'Masa' },
	{ value: 'VOLUME', label: 'Volumen' },
	{ value: 'COUNT', label: 'Conteo' },
	{ value: 'TIME', label: 'Tiempo' },
	{ value: 'AREA', label: 'Área' },
	{ value: 'LENGTH', label: 'Longitud' }
];

/**
 * A company-owned unit of measure. A null factor marks a unit that never converts on its own
 * (dose, head, workday): only an item presentation bridges it to another unit.
 */
export interface UnitOfMeasure {
	id: number;
	code: string;
	name: string;
	symbol: string;
	dimension: UnitDimension;
	dimensionLabel: string;
	factorToBase: number | null;
	isBase: boolean;
	isConvertible: boolean;
	isActive: boolean;
	displayOrder: number;
	/** Items counted in this unit: dimension and factor freeze while it is above zero. */
	itemsCount: number;
}

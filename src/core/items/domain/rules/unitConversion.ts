import { UnitOfMeasure } from '../entities/UnitOfMeasure';
import { formatQuantity } from './presentationName';

/** "1 qq = 100 kg", "Base de la dimensión" or "No convertible". */
export function describeFactor(unit: UnitOfMeasure, base: UnitOfMeasure | undefined): string {
	if (unit.isBase) {
		return 'Base de la dimensión';
	}
	if (unit.factorToBase === null) {
		return 'No convertible';
	}
	return `1 ${unit.symbol} = ${formatQuantity(unit.factorToBase)} ${base?.symbol ?? ''}`.trim();
}

export function baseOf(units: UnitOfMeasure[], dimension: UnitOfMeasure['dimension']): UnitOfMeasure | undefined {
	return units.find((u) => u.dimension === dimension && u.isBase);
}

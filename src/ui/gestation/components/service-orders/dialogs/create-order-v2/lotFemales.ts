import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';

/** The females of a batch, by what the rules of a service do with each one. */
export interface LotFemales {
	/** Empty and of a breeding category: what a natural service exposes. */
	serviceable: Caravan[];
	/** Serviceable, not excluded by the owner and owing no tacto: what can be picked one by one. */
	apt: Caravan[];
	/** Serviceable but excluded by the owner from breeding. */
	excluded: Caravan[];
	pregnant: Caravan[];
	/** Serviceable but still owing her tacto to another order. */
	pendingTacto: Caravan[];
}

const isFemale = (c: Caravan) => c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA';
export const isMale = (c: Caravan) => c.sex === 'M' || (c.sex as string) === 'MACHO';

export const EMPTY_LOT: LotFemales = { serviceable: [], apt: [], excluded: [], pregnant: [], pendingTacto: [] };

export function indexLotFemales(caravans: Caravan[], owingTacto: ReadonlyMap<number, unknown>): Map<number, LotFemales> {
	const lots = new Map<number, LotFemales>();

	caravans.forEach((caravan) => {
		if (!caravan.batch_id || !isFemale(caravan)) return;

		const lot = lots.get(caravan.batch_id) ?? { serviceable: [], apt: [], excluded: [], pregnant: [], pendingTacto: [] };
		lots.set(caravan.batch_id, lot);

		if (caravan.active_gestation) {
			lot.pregnant.push(caravan);
		} else if (isBreedingCandidate(caravan)) {
			lot.serviceable.push(caravan);

			if (owingTacto.has(caravan.id!)) lot.pendingTacto.push(caravan);

			if (!caravan.is_breeding_eligible) lot.excluded.push(caravan);
			else if (!owingTacto.has(caravan.id!)) lot.apt.push(caravan);
		}
	});

	return lots;
}

/** Females that can be added to a registered order from any batch: empty, of a breeding category. */
export function registrableFemales(caravans: Caravan[]): Caravan[] {
	return caravans.filter((c) => isFemale(c) && !c.active_gestation && isBreedingCandidate(c));
}

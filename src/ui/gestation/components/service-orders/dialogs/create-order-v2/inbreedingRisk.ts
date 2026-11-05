import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { InbreedingRisk, simulateMating } from '@/core/caravans/domain/services/pedigreeAnalysis';
import { EMPTY_LOT, LotFemales } from './lotFemales';
import { SelectedBatchState } from './types';

/** From a first-cousin mating on, a cross deserves a look before the bulls go in. */
const RISKY_FROM_PERCENT = 6.25;

export interface RiskyMating {
	batchName: string;
	femaleTag: string;
	bullTag: string;
	/** Projected inbreeding of the calf (Wright's Fx), in percent. */
	fx: number;
	risk: InbreedingRisk;
}

const femalesOf = (lot: SelectedBatchState, females: LotFemales | undefined): number[] =>
	lot.mode === 'complete' ? (females ?? EMPTY_LOT).serviceable.map((female) => female.id!) : lot.selectedCaravanIds;

/**
 * The risky crosses of the sheet, worst first. Each female counts once, with her riskiest bull: in a
 * shared paddock nobody knows which one will serve her.
 */
export function findRiskyMatings(
	lots: SelectedBatchState[],
	bullsByBatch: Record<number, number[]>,
	femalesByBatch: Map<number, LotFemales>,
	caravans: Caravan[]
): RiskyMating[] {
	const caravansById = new Map(caravans.map((caravan) => [caravan.id!, caravan]));

	return lots
		.flatMap((lot) =>
			femalesOf(lot, femalesByBatch.get(lot.batchId)).flatMap((femaleId) => {
				const worst = (bullsByBatch[lot.batchId] ?? [])
					.map((bullId) => simulateMating(femaleId, bullId, caravansById))
					.reduce(
						(highest, mating) =>
							mating && (!highest || mating.projectedInbreeding > highest.projectedInbreeding)
								? mating
								: highest,
						null
					);

				return worst && worst.projectedInbreeding >= RISKY_FROM_PERCENT
					? [
							{
								batchName: lot.batchName,
								femaleTag: worst.dam.identification,
								bullTag: worst.sire.identification,
								fx: worst.projectedInbreeding,
								risk: worst.risk
							}
						]
					: [];
			})
		)
		.sort((a, b) => b.fx - a.fx);
}

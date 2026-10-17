/**
 * Why the owner left an animal out of breeding. Management reasons only: the veterinary
 * verdict lives in the pre-service evaluation and never becomes one of these codes.
 * Mirrors App\Core\Enums\BreedingExclusionReason.
 */
export type BreedingExclusionReasonCode =
	| 'CUT_DENTITION'
	| 'LOW_BODY_CONDITION'
	| 'REPRODUCTIVE_DEFECT'
	| 'IMMATURE'
	| 'LOCOMOTOR_DEFECT'
	| 'SENILE'
	| 'RESERVED'
	| 'RESTING'
	| 'SCHEDULED_FOR_SALE'
	| 'OTHER';

type Sex = 'M' | 'H';

export interface BreedingExclusionReasonOption {
	code: BreedingExclusionReasonCode;
	label: string;
	sexes: Sex[];
}

export const BREEDING_EXCLUSION_REASONS: BreedingExclusionReasonOption[] = [
	{ code: 'CUT_DENTITION', label: 'Vaca CUT / desgaste dental', sexes: ['H'] },
	{ code: 'LOW_BODY_CONDITION', label: 'Baja condición corporal', sexes: ['H'] },
	{ code: 'REPRODUCTIVE_DEFECT', label: 'Problema reproductivo', sexes: ['H'] },
	{ code: 'IMMATURE', label: 'Sin desarrollo / se retiene sin servicio', sexes: ['H'] },
	{ code: 'LOCOMOTOR_DEFECT', label: 'Aplomos / renguera', sexes: ['M'] },
	{ code: 'SENILE', label: 'Toro viejo', sexes: ['M'] },
	{ code: 'RESERVED', label: 'Reservado (cabaña / IA)', sexes: ['M'] },
	{ code: 'RESTING', label: 'Descanso', sexes: ['M'] },
	{ code: 'SCHEDULED_FOR_SALE', label: 'Destino venta / engorde', sexes: ['M', 'H'] },
	{ code: 'OTHER', label: 'Otro motivo', sexes: ['M', 'H'] }
];

/** Reasons that fit every given sex: a mixed selection only gets the shared ones. */
export function reasonsForSexes(sexes: Sex[]): BreedingExclusionReasonOption[] {
	return BREEDING_EXCLUSION_REASONS.filter((reason) => sexes.every((sex) => reason.sexes.includes(sex)));
}

export function reasonRequiresNote(code: BreedingExclusionReasonCode | null | undefined): boolean {
	return code === 'OTHER';
}

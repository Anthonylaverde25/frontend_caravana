import type { BullHealthEvaluation } from '@/core/pre-service/domain/BullHealthEvaluation';
import { ReproductiveAptitudeStatus } from '@/core/pre-service/enums/PreServiceEnums';

/**
 * Whether a bull can enter a service, combining the owner's decision with the veterinary
 * verdict where one exists. Mirrors App\Core\Services\BullServiceFitnessPolicy; the backend
 * remains the authority (a deployment can require a sanitary certificate).
 */
export type SireAdmission =
	| { kind: 'ADMITTED' }
	| { kind: 'ADMITTED_WITH_WARNING'; reason: 'NOT_EVALUATED' | 'PENDING_EVALUATION' }
	| { kind: 'EXCLUDED_BY_OWNER'; reasonLabel: string | null }
	| { kind: 'VET_BLOCKED'; status: 'UNFIT' | 'IN_TREATMENT'; diagnoses: string[] };

interface SireLike {
	is_breeding_eligible?: boolean;
	breeding_exclusion_reason_label?: string | null;
}

export function resolveSireAdmission(sire: SireLike, health: BullHealthEvaluation | undefined): SireAdmission {
	if (sire.is_breeding_eligible === false) {
		return { kind: 'EXCLUDED_BY_OWNER', reasonLabel: sire.breeding_exclusion_reason_label ?? null };
	}

	// The pre-service list also returns never-evaluated bulls, without an evaluation id.
	if (health === undefined || health.id === null) {
		return { kind: 'ADMITTED_WITH_WARNING', reason: 'NOT_EVALUATED' };
	}

	if (health.status === ReproductiveAptitudeStatus.UNFIT || health.status === ReproductiveAptitudeStatus.IN_TREATMENT) {
		return {
			kind: 'VET_BLOCKED',
			status: health.status === ReproductiveAptitudeStatus.UNFIT ? 'UNFIT' : 'IN_TREATMENT',
			diagnoses: health.active_diagnoses.map((d) => d.pathogen_name ?? d.pathogen_code ?? '').filter(Boolean)
		};
	}

	if (health.status === ReproductiveAptitudeStatus.PENDING_EVALUATION) {
		return { kind: 'ADMITTED_WITH_WARNING', reason: 'PENDING_EVALUATION' };
	}

	return { kind: 'ADMITTED' };
}

export function isSelectable(admission: SireAdmission): boolean {
	return admission.kind === 'ADMITTED' || admission.kind === 'ADMITTED_WITH_WARNING';
}

import type {
  CloseServiceOrderDiagnosisPayload,
  DiagnosisFemale,
  FemaleReproductiveVerdict,
  ServiceClosureBullAction,
  ServiceClosureRemainingFemalesAction,
} from '@/features/gestation/hooks/useServiceOrders';
import { DiagnosisEntryState, entryOf, isPendingOn, toPayload } from '../../diagnosis-entry/diagnosisEntryModel';

export type CloseStep = 'confirm' | 'bulls';

/** Order-level decisions of the closing (confirmation and bulls). */
export interface ClosingDecisions {
  closingDate: string;
  observations: string;
  emptiesTargetBatchId: number | null;
  bullAction: ServiceClosureBullAction | null;
  bullDestinationBatchId: number | null;
  scheduledMovementDate: string;
  remainingAction: ServiceClosureRemainingFemalesAction | null;
  remainingTargetBatchId: number | null;
}

export interface ProjectedClosing {
  pregnant: number;
  empty: number;
  notDiagnosed: number;
  exited: number;
  stillPending: number;
  rate: number | null;
  /** Empty or without diagnosis, still in the service batch after the closing. */
  nonPregnantInServiceBatch: number;
  emptiesInServiceBatch: number;
  statedThisRound: number;
}

/** Verdict each female would have once the round on screen is saved. */
function projectedVerdict(female: DiagnosisFemale, state: DiagnosisEntryState, closingDate: string): FemaleReproductiveVerdict {
  const stated = entryOf(state, female.female_caravan_id).result;
  if (stated !== 'UNCHECKED') return stated;
  if (female.reproductive_status === 'EXITED') return 'EXITED';
  return isPendingOn(female, closingDate) ? 'UNCHECKED' : female.reproductive_status;
}

export function projectClosing(
  females: DiagnosisFemale[],
  state: DiagnosisEntryState,
  closingDate: string,
  serviceBatchId: number
): ProjectedClosing {
  const projection: ProjectedClosing = {
    pregnant: 0,
    empty: 0,
    notDiagnosed: 0,
    exited: 0,
    stillPending: 0,
    rate: null,
    nonPregnantInServiceBatch: 0,
    emptiesInServiceBatch: 0,
    statedThisRound: 0,
  };

  females.forEach((female) => {
    const value = entryOf(state, female.female_caravan_id);
    if (value.result !== 'UNCHECKED') projection.statedThisRound++;

    const verdict = projectedVerdict(female, state, closingDate);
    const leavesNow = value.result === 'EMPTY' && value.empty_destination_batch_id !== null;
    const inServiceBatch = female.current_batch_id === serviceBatchId && !leavesNow;

    switch (verdict) {
      case 'PREGNANT':
        projection.pregnant++;
        break;
      case 'EMPTY':
        projection.empty++;
        if (inServiceBatch) {
          projection.emptiesInServiceBatch++;
          projection.nonPregnantInServiceBatch++;
        }
        break;
      case 'NOT_DIAGNOSED':
        projection.notDiagnosed++;
        if (inServiceBatch) projection.nonPregnantInServiceBatch++;
        break;
      case 'EXITED':
        projection.exited++;
        break;
      default:
        projection.stillPending++;
    }
  });

  const denominator = projection.pregnant + projection.empty;
  projection.rate = denominator > 0 ? Math.round((projection.pregnant * 10000) / denominator) / 100 : null;

  return projection;
}

/**
 * Why the decisions of the closing cannot be sent yet, or null. Validated on click.
 */
export function decisionsProblem(
  decisions: ClosingDecisions,
  needsBullDecision: boolean,
  projection: ProjectedClosing
): string | null {
  if (!needsBullDecision) return null;
  if (!decisions.bullAction) return 'Indicá qué pasa con los toros.';
  if (decisions.bullAction !== 'STAY' && !decisions.bullDestinationBatchId) return 'Elegí el lote de destino de los toros.';
  if (decisions.bullAction === 'SCHEDULE' && decisions.scheduledMovementDate < decisions.closingDate) {
    return 'La fecha programada no puede ser anterior al cierre.';
  }
  if (decisions.bullAction !== 'MOVE_NOW' && projection.nonPregnantInServiceBatch > 0) {
    if (!decisions.remainingAction) return 'Decidí qué pasa con los vientres no preñados que quedarían con los toros.';
    if (decisions.remainingAction === 'MOVE_OUT' && !decisions.remainingTargetBatchId) return 'Elegí el lote al que salen los vientres no preñados.';
  }
  return null;
}

export function buildClosePayload(
  state: DiagnosisEntryState,
  decisions: ClosingDecisions,
  needsBullDecision: boolean,
  projection: ProjectedClosing
): CloseServiceOrderDiagnosisPayload {
  const { diagnoses, notDiagnosed } = toPayload(state);
  const keepsBulls = needsBullDecision && decisions.bullAction !== 'MOVE_NOW';
  const remainingDecided = keepsBulls && projection.nonPregnantInServiceBatch > 0;

  return {
    closing_date: decisions.closingDate,
    round_date: decisions.closingDate,
    observations: decisions.observations.trim() || null,
    diagnoses,
    not_diagnosed: notDiagnosed,
    empties_target_batch_id: keepsBulls ? null : decisions.emptiesTargetBatchId,
    bull_action: needsBullDecision ? decisions.bullAction : null,
    bull_destination_batch_id: needsBullDecision && decisions.bullAction !== 'STAY' ? decisions.bullDestinationBatchId : null,
    scheduled_movement_date: needsBullDecision && decisions.bullAction === 'SCHEDULE' ? decisions.scheduledMovementDate : null,
    remaining_females_action: remainingDecided ? decisions.remainingAction : null,
    remaining_females_target_batch_id:
      remainingDecided && decisions.remainingAction === 'MOVE_OUT' ? decisions.remainingTargetBatchId : null,
  };
}

import type {
  DiagnosisFemale,
  NotDiagnosedPayload,
  NotDiagnosedReason,
  ScreenDiagnosisPayload,
} from '@/features/gestation/hooks/useServiceOrders';

/** What the producer states for a female in this round. UNCHECKED: nothing (she is not sent). */
export type EntryResult = 'UNCHECKED' | 'PREGNANT' | 'EMPTY' | 'NOT_DIAGNOSED';

export type GestationStageCode = 'head' | 'body' | 'tail';

export interface DiagnosisEntryValue {
  result: EntryResult;
  /** Optional: many producers only declare "pregnant". */
  gestation_stage: GestationStageCode | null;
  /** Optional; when given, the stage is derived from it. */
  gestation_months: number | null;
  /** Empty female leaving the service batch at the chute. */
  empty_destination_batch_id: number | null;
  not_diagnosed_reason: NotDiagnosedReason | null;
  not_diagnosed_notes: string;
}

export type DiagnosisEntryState = Record<number, DiagnosisEntryValue>;

export const EMPTY_ENTRY: DiagnosisEntryValue = {
  result: 'UNCHECKED',
  gestation_stage: null,
  gestation_months: null,
  empty_destination_batch_id: null,
  not_diagnosed_reason: null,
  not_diagnosed_notes: '',
};

export function entryOf(state: DiagnosisEntryState, femaleId: number): DiagnosisEntryValue {
  return state[femaleId] ?? EMPTY_ENTRY;
}

/** Changing the result clears what only made sense for the previous one. */
export function withResult(value: DiagnosisEntryValue, result: EntryResult): DiagnosisEntryValue {
  return {
    ...EMPTY_ENTRY,
    result,
    not_diagnosed_reason: result === 'NOT_DIAGNOSED' ? value.not_diagnosed_reason : null,
    not_diagnosed_notes: result === 'NOT_DIAGNOSED' ? value.not_diagnosed_notes : '',
  };
}

/** Why a row cannot be sent as it is, or null. Validated on click, never live. */
export function entryProblem(value: DiagnosisEntryValue): string | null {
  if (value.result === 'NOT_DIAGNOSED') {
    if (!value.not_diagnosed_reason) return 'Elegí el motivo';
    if (value.not_diagnosed_reason === 'OTHER' && value.not_diagnosed_notes.trim() === '') return 'Escribí el motivo';
  }
  if (value.result === 'PREGNANT' && value.gestation_months !== null) {
    if (value.gestation_months < 0.5 || value.gestation_months > 9.5) return 'Meses entre 0,5 y 9,5';
  }
  return null;
}

/**
 * A female needs a verdict to close the order on `closingDate`: unchecked, or empty scanned while
 * she was still with the bulls (her exposure ending after that scan).
 */
export function isPendingOn(female: DiagnosisFemale, closingDate: string): boolean {
  if (female.reproductive_status === 'UNCHECKED') return true;
  if (female.reproductive_status !== 'EMPTY') return false;
  // AI without repaso (semen S-B, IA11): only the straws exposed her.
  if (female.empty_final_after) return (female.diagnosed_at ?? '') < female.empty_final_after;
  const end = female.exposed_until ?? closingDate;
  return (female.diagnosed_at ?? '') < end;
}

/** Splits what was stated into the screen diagnoses and the "sin diagnóstico" declarations. */
export function toPayload(state: DiagnosisEntryState): { diagnoses: ScreenDiagnosisPayload[]; notDiagnosed: NotDiagnosedPayload[] } {
  const diagnoses: ScreenDiagnosisPayload[] = [];
  const notDiagnosed: NotDiagnosedPayload[] = [];

  Object.entries(state).forEach(([id, value]) => {
    const femaleId = Number(id);
    if (value.result === 'PREGNANT' || value.result === 'EMPTY') {
      const pregnant = value.result === 'PREGNANT';
      diagnoses.push({
        caravan_id: femaleId,
        is_pregnant: pregnant,
        gestation_stage: pregnant && value.gestation_months === null ? value.gestation_stage : null,
        gestation_months: pregnant ? value.gestation_months : null,
        empty_destination_batch_id: pregnant ? null : value.empty_destination_batch_id,
      });
    } else if (value.result === 'NOT_DIAGNOSED' && value.not_diagnosed_reason) {
      notDiagnosed.push({
        female_caravan_id: femaleId,
        reason: value.not_diagnosed_reason,
        notes: value.not_diagnosed_notes.trim() || null,
      });
    }
  });

  return { diagnoses, notDiagnosed };
}

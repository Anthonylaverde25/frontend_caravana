import type { DiagnosisFemale } from '@/features/gestation/hooks/useServiceOrders';
import { VERDICT_SHORT_LABELS, formatDay } from '@/ui/gestation/utils/reproductiveVerdict';
import type { EntryResult } from './diagnosisEntryModel';

export interface VerdictNotices {
  /** What deserves a look before saving: a re-check, an early empty. */
  warning?: string;
  /** What only informs: the verdict this round replaces. */
  info?: string;
}

/**
 * Non-blocking notices of a row of the tacto sheet, shown before saving: the verdict the female
 * already had (a re-check replaces it), an empty that must be re-checked, and an empty stated
 * before the suggested day (an early pregnancy may still be undetectable). `suggestedDate` is the
 * bull withdrawal + 45 days.
 */
export function previousVerdictNotices(female: DiagnosisFemale, result: EntryResult, roundDate: string, suggestedDate: string | null): VerdictNotices {
  const warnings: string[] = [];
  let info: string | undefined;
  const previous = female.previous_diagnosis;

  if (female.reproductive_status === 'UNCHECKED' && previous?.verdict === 'EMPTY') {
    warnings.push(`Vacía el ${formatDay(previous.round_date)} · siguió expuesta: re-tactar.`);
  } else if (female.reproductive_status === 'UNCHECKED' && previous?.verdict === 'PREGNANT') {
    warnings.push(`Preñada el ${formatDay(previous.round_date)} · pérdida: re-tactar.`);
  } else if (female.is_provisional_empty) {
    warnings.push(`Vacía el ${formatDay(female.diagnosed_at)} con los toros en el lote: re-tactar.`);
  } else if (female.reproductive_status !== 'UNCHECKED' && result !== 'UNCHECKED') {
    info = `Ya tenía ${VERDICT_SHORT_LABELS[female.reproductive_status]} del ${formatDay(female.diagnosed_at)}; se reemplaza.`;
  }

  if (result === 'EMPTY' && suggestedDate && roundDate < suggestedDate) {
    warnings.push(`Tacto antes del ${formatDay(suggestedDate)}: puede ser una preñez temprana todavía no detectable.`);
  }

  return { warning: warnings.length > 0 ? warnings.join(' ') : undefined, info };
}

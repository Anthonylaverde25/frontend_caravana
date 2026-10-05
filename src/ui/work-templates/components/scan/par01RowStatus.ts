import {
  BIRTH_OUTCOME_LABELS,
  BirthOrderAnimal,
  BirthSheetMark,
  isResolvedBirthLine,
  parseBirthSheetMark
} from '@/features/birth-orders/types';
import { formatDate } from '@/ui/birth-orders/components/birthOrderFormat';
import type { Par01Row } from '../../hooks/usePar01Pages';

/**
 * Where one reviewed row stands against its order (R1), the mirror of the API's reconciliation:
 * - `new`: something to register — a pending female, or an overdue one the paper says calved;
 * - `already`: the paper says what is registered, or nothing new: skipped, read-only;
 * - `differs`: the paper says something else than what is registered: kept as registered, warned;
 * - `overdue_kept`: an overdue female still marked only with N: skipped, the alert stays open.
 */
export type Par01RowKind = 'new' | 'already' | 'differs' | 'overdue_kept';

export interface Par01RowStatus {
  kind: Par01RowKind;
  mark: BirthSheetMark;
  message: string | null;
}

const registeredOf = (animal: BirthOrderAnimal): string => {
  if (animal.loss_reason_code) return `Pérdida registrada aparte: ${animal.loss_reason_label ?? animal.loss_reason_code}`;

  const label = animal.outcome_label ?? animal.status;

  return animal.calf_identification ? `${label} (cría ${animal.calf_identification})` : label;
};

const sameTag = (a: string | null, b: string | null): boolean => (a ?? '').trim().toUpperCase() === (b ?? '').trim().toUpperCase() && (a ?? '') !== '';

export const par01RowStatus = (row: Par01Row, animal: BirthOrderAnimal | null): Par01RowStatus => {
  const mark = parseBirthSheetMark(row.resultado);

  if (!animal) return { kind: 'new', mark, message: null };

  if (animal.status === 'OVERDUE') {
    return mark.empty || (mark.overdue && !mark.outcome && !mark.abortion && !mark.ambiguous)
      ? { kind: 'overdue_kept', mark, message: `No parió en fecha · avisado el ${formatDate(animal.overdue_reported_at)}` }
      : { kind: 'new', mark, message: null };
  }

  if (!isResolvedBirthLine(animal.status)) return { kind: 'new', mark, message: null };

  const on = animal.event_date ? ` el ${formatDate(animal.event_date)}` : '';
  const registered = registeredOf(animal);
  const matches =
    mark.outcome !== null && mark.outcome === animal.outcome && (mark.outcome !== 'LIVE' || sameTag(row.caravana_cria, animal.calf_identification));

  if (matches || (!mark.outcome && !mark.abortion && !mark.ambiguous)) {
    return { kind: 'already', mark, message: `Ya registrada${on}: ${registered}` };
  }

  const paper = mark.outcome
    ? `${BIRTH_OUTCOME_LABELS[mark.outcome]}${mark.outcome === 'LIVE' && row.caravana_cria ? ` (cría ${row.caravana_cria})` : ''}`
    : mark.abortion
      ? 'Aborto'
      : `«${row.resultado}»`;

  return { kind: 'differs', mark, message: `La planilla dice ${paper}; ya se registró ${registered}${on}. Se conserva lo registrado.` };
};

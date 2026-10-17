import type { DiagnosisFemale, DiagnosisRound, ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { isPendingOn } from '../diagnosis-entry/diagnosisEntryModel';

/**
 * "round": a diagnosis round, saved on its own; the order stays open. "close": the missing
 * verdicts of "Cerrar orden": every pending female is required and nothing is saved until the
 * closing, which sends the verdicts and the closing together.
 */
export type TactoMode = 'round' | 'close';

/** Router state of the entry points: where "Cargar tacto" was opened from, and why. */
export interface TactoEntryState {
  returnTo?: string;
  mode?: TactoMode;
}

export const DIAGNOSIS_TRAY_PATH = '/gestation/tacto';

/** The diagnosis tray, opened on one order. */
export const diagnosisTrayPath = (orderId: number) => `${DIAGNOSIS_TRAY_PATH}?orderId=${orderId}`;

/** Females still without a final verdict if the order were closed today. */
export function pendingToClose(order: ServiceOrder): number {
  return order.pending_if_closed_today ?? order.diagnosis_summary?.pending ?? 0;
}

export type TactoFemaleFilter = 'pending' | 'provisional' | 'diagnosed' | 'stated' | 'all';

export const TACTO_FILTER_LABELS: Record<TactoFemaleFilter, string> = {
  pending: 'Pendientes',
  provisional: 'Vacías provisorias',
  diagnosed: 'Ya diagnosticadas',
  stated: 'Con resultado',
  all: 'Todos',
};

export const tactoStartPath = (orderId: number) => `/gestation/service-orders/${orderId}/bulk-tacto`;

/** Where a round or a closing lands by default: the diagnosis tray, on that order. */
export const defaultReturnTo = diagnosisTrayPath;

/** Females that can be checked in a round: a female that died or was sold has no verdict to give. */
export function diagnosableFemales(females: DiagnosisFemale[]): DiagnosisFemale[] {
  return females.filter((female) => female.reproductive_status !== 'EXITED');
}

/** `stated`: the female already has a result typed in this round. */
export function matchesFilter(female: DiagnosisFemale, filter: TactoFemaleFilter, roundDate: string, stated: boolean): boolean {
  switch (filter) {
    case 'pending':
      return isPendingOn(female, roundDate);
    case 'provisional':
      return female.is_provisional_empty;
    case 'diagnosed':
      return !isPendingOn(female, roundDate);
    case 'stated':
      return stated;
    default:
      return true;
  }
}

/** "Se suma a la ronda 2" when the day already has a round, "Abre la ronda 3" otherwise. */
export function roundLabel(rounds: DiagnosisRound[], roundDate: string): string {
  const existing = rounds.find((round) => round.round_date === roundDate);
  if (existing) return `Se suma a la ronda ${existing.number}`;
  return `Abre la ronda ${rounds.filter((round) => round.round_date < roundDate).length + 1}`;
}

export interface TactoFemaleGroup {
  key: string;
  batchName: string;
  isServiceBatch: boolean;
  females: DiagnosisFemale[];
}

/** Females by their current batch, the service batch first: an empty moved out stays reachable. */
export function groupByBatch(females: DiagnosisFemale[], serviceBatchId: number): TactoFemaleGroup[] {
  const groups = new Map<string, TactoFemaleGroup>();
  females.forEach((female) => {
    const key = String(female.current_batch_id ?? 'none');
    const group = groups.get(key) ?? {
      key,
      batchName: female.current_batch_name ?? 'Sin lote',
      isServiceBatch: female.current_batch_id === serviceBatchId,
      females: [],
    };
    group.females.push(female);
    groups.set(key, group);
  });
  return [...groups.values()].sort((a, b) => Number(b.isServiceBatch) - Number(a.isServiceBatch) || a.batchName.localeCompare(b.batchName));
}

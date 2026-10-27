import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { formatDay } from './reproductiveVerdict';
import { hasServiceEnded } from './serviceOrderStatus';

/**
 * What the user sees as the state of an order. The stored status follows the bulls (in the batch,
 * withdrawn, closed); the diagnosis runs alongside from the first day of service. The phase joins
 * both: it is derived, never stored, so it cannot drift when a female joins or a provisional
 * empty goes back to pending.
 */
export type ServiceOrderPhase =
  | 'DRAFT'
  | 'IN_SERVICE'
  | 'INSEMINATING'
  | 'BULLS_WITHDRAWN'
  | 'DIAGNOSING'
  | 'READY_TO_CLOSE'
  | 'DIAGNOSED'
  | 'REJECTED'
  | 'CANCELLED';

export type PhaseColor = 'default' | 'info' | 'warning' | 'primary' | 'success' | 'error';

export interface ServiceOrderPhaseInfo {
  phase: ServiceOrderPhase;
  label: string;
  color: PhaseColor;
  /** Where the bulls are and how far the diagnosis went; null when there is nothing to add. */
  detail: string | null;
  isOpen: boolean;
}

export const PHASE_LABELS: Record<ServiceOrderPhase, string> = {
  DRAFT: 'Borrador',
  IN_SERVICE: 'En servicio',
  INSEMINATING: 'Inseminando',
  BULLS_WITHDRAWN: 'Tacto pendiente',
  DIAGNOSING: 'Tacto en curso',
  READY_TO_CLOSE: 'Lista para cerrar',
  DIAGNOSED: 'Diagnosticada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

const PHASE_COLORS: Record<ServiceOrderPhase, PhaseColor> = {
  DRAFT: 'default',
  IN_SERVICE: 'info',
  INSEMINATING: 'info',
  BULLS_WITHDRAWN: 'warning',
  DIAGNOSING: 'primary',
  READY_TO_CLOSE: 'success',
  DIAGNOSED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

const CLOSED_PHASES: Record<string, ServiceOrderPhase> = {
  DRAFT: 'DRAFT',
  SUCCESS: 'DIAGNOSED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

function info(phase: ServiceOrderPhase, detail: string | null, isOpen: boolean): ServiceOrderPhaseInfo {
  return { phase, label: PHASE_LABELS[phase], color: PHASE_COLORS[phase], detail, isOpen };
}

function formatRate(rate: number | null | undefined, kind: 'parcial' | 'final'): string {
  return rate !== null && rate !== undefined ? ` · preñez ${kind} ${rate.toFixed(1)}%` : '';
}

export function getServiceOrderPhase(order: ServiceOrder): ServiceOrderPhaseInfo {
  const status = order.status.toUpperCase();

  if (status === 'SUCCESS') {
    const rate = formatRate(order.final_pregnancy_rate, 'final').replace(/^ · /, '');
    return info('DIAGNOSED', rate || null, false);
  }
  if (status in CLOSED_PHASES) return info(CLOSED_PHASES[status], null, false);
  if (status !== 'APPROVED' && !hasServiceEnded(status)) {
    return { phase: 'DRAFT', label: order.status, color: 'default', detail: null, isOpen: false };
  }

  const bullsWithdrawn = hasServiceEnded(status);
  const ai = order.service_method === 'AI' ? order.insemination_summary : null;
  const bulls = ai ? inseminationDetail(ai, bullsWithdrawn) : bullsWithdrawn ? 'Toros retirados' : 'Toros en lote';
  const summary = order.diagnosis_summary;
  const baseline: ServiceOrderPhase = bullsWithdrawn ? 'BULLS_WITHDRAWN' : ai ? 'INSEMINATING' : 'IN_SERVICE';

  // A provisional empty was scanned: the tacto happened, even though her verdict is not final yet.
  const provisional = summary?.provisional_empty ?? 0;
  const scanned = (summary?.evaluated ?? 0) + provisional;

  if (!summary || summary.total === 0 || scanned === 0) {
    const suggested = bullsWithdrawn && order.suggested_diagnosis_date ? ` · tactar desde ${formatDay(order.suggested_diagnosis_date)}` : ' · sin tactar';
    return info(baseline, `${bulls}${suggested}`, true);
  }

  // Closing today ends the exposure: empties scanned today become final, so the order can close.
  const pendingToClose = order.pending_if_closed_today ?? summary.pending;
  const provisionalNote = provisional > 0 ? ` · ${provisional} vacía(s) provisoria(s)` : '';
  const progress = `${scanned}/${summary.total}${formatRate(summary.partial_rate, 'parcial')}${provisionalNote}`;
  const phase: ServiceOrderPhase = pendingToClose === 0 ? 'READY_TO_CLOSE' : 'DIAGNOSING';
  return info(phase, `${bulls} · tacto ${progress}`, true);
}

/** AI (semen S-B): how far the inseminations went and whether repaso bulls are in the batch. */
function inseminationDetail(ai: NonNullable<ServiceOrder['insemination_summary']>, ended: boolean): string {
  const progress = `${ai.inseminated}/${ai.females} inseminadas`;
  if (ended) return `Servicio terminado · ${progress}`;
  return ai.repaso_bulls_active > 0 ? `${progress} · toros de repaso en lote` : progress;
}

/** One line under the batch name: what serves the females (bulls, or AI with its repaso bulls). */
export function orderHeadline(order: ServiceOrder): string {
  const females = `${order.female_caravan_ids.length} vientres`;
  if (order.service_method !== 'AI') return `${order.male_caravan_ids.length} toros · ${females}`;
  const repaso = order.insemination_summary?.repaso_bulls_active ?? 0;
  return `IA · ${females}${repaso > 0 ? ` · ${repaso} toro(s) de repaso` : ''}`;
}

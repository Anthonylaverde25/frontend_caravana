import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { getServiceOrderPhase, PHASE_LABELS, type ServiceOrderPhase } from './serviceOrderPhase';
import { computeServiceOrderTemporalStatus } from './serviceOrderTemporalStatus';
import { formatDay } from './reproductiveVerdict';

/** Phases an open order can be in, in the order the tray shows them: what can be finished first. */
export const TRAY_PHASES = ['READY_TO_CLOSE', 'DIAGNOSING', 'BULLS_WITHDRAWN', 'INSEMINATING', 'IN_SERVICE'] as const satisfies readonly ServiceOrderPhase[];

export type TrayPhase = (typeof TRAY_PHASES)[number];

export interface TraySection {
  phase: TrayPhase;
  title: string;
  subtitle: string;
  orders: ServiceOrder[];
}

const SUBTITLES: Record<TrayPhase, string> = {
  READY_TO_CLOSE: 'Todos los vientres tienen diagnóstico: se pueden cerrar hoy.',
  DIAGNOSING: 'Tacto empezado: faltan vientres o hay vacías provisorias para volver a tactar.',
  BULLS_WITHDRAWN: 'Toros retirados y sin tactar: esperan su primera ronda.',
  INSEMINATING: 'Inseminación artificial en curso: cargá las inseminaciones; al cerrar la orden termina el servicio.',
  IN_SERVICE: 'Toros en el lote: se puede tactar ya; las vacías quedan firmes al cerrar o al salir del lote.',
};

/**
 * Most urgent first: an overdue service window, then the fewest days left, then the oldest order.
 * Orders without a window keep their relative order at the end.
 */
function byUrgency(a: ServiceOrder, b: ServiceOrder): number {
  const ta = computeServiceOrderTemporalStatus(a);
  const tb = computeServiceOrderTemporalStatus(b);
  if (ta.isOverdue !== tb.isOverdue) return ta.isOverdue ? -1 : 1;
  const da = ta.daysRemaining ?? Number.POSITIVE_INFINITY;
  const db = tb.daysRemaining ?? Number.POSITIVE_INFINITY;
  if (da !== db) return da - db;
  return a.id - b.id;
}

/** Open orders grouped by their phase; phases without orders are left out. */
export function groupOrdersForTray(orders: ServiceOrder[]): TraySection[] {
  const byPhase = new Map<TrayPhase, ServiceOrder[]>(TRAY_PHASES.map((phase) => [phase, []]));

  for (const order of orders) {
    const { phase, isOpen } = getServiceOrderPhase(order);
    if (isOpen) byPhase.get(phase as TrayPhase)?.push(order);
  }

  return TRAY_PHASES.map((phase) => ({
    phase,
    title: PHASE_LABELS[phase],
    subtitle: SUBTITLES[phase],
    orders: [...(byPhase.get(phase) ?? [])].sort(byUrgency),
  })).filter((section) => section.orders.length > 0);
}

/** DOM id of a tray section, used by the summary anchors. */
export const traySectionId = (phase: TrayPhase) => `tray-${phase.toLowerCase()}`;

/** DOM id of an order card, used to scroll to `?orderId`. */
export const trayCardId = (orderId: number) => `tray-order-${orderId}`;

/** Palette key of each tray phase: its dot, its band tint and its summary tile. */
export const TRAY_PHASE_COLOR: Record<TrayPhase, 'success' | 'primary' | 'warning' | 'info'> = {
  READY_TO_CLOSE: 'success',
  DIAGNOSING: 'primary',
  BULLS_WITHDRAWN: 'warning',
  INSEMINATING: 'info',
  IN_SERVICE: 'info',
};

/** Where an order stands against its service window. */
export type TrayDeadline = 'OVERDUE' | 'CLOSING_SOON' | 'ON_TRACK' | 'SERVICE_ENDED';

export const TRAY_DEADLINES = ['OVERDUE', 'CLOSING_SOON', 'ON_TRACK', 'SERVICE_ENDED'] as const satisfies readonly TrayDeadline[];

export const TRAY_DEADLINE_LABELS: Record<TrayDeadline, string> = {
  OVERDUE: 'Vencidas',
  CLOSING_SOON: 'Por vencer',
  ON_TRACK: 'En término',
  SERVICE_ENDED: 'Servicio terminado',
};

export const TRAY_DEADLINE_COLOR: Record<TrayDeadline, 'error' | 'warning' | 'info' | 'grey'> = {
  OVERDUE: 'error',
  CLOSING_SOON: 'warning',
  ON_TRACK: 'info',
  SERVICE_ENDED: 'grey',
};

export function getTrayDeadline(order: ServiceOrder): TrayDeadline {
  const temporal = computeServiceOrderTemporalStatus(order);
  if (temporal.isBullsWithdrawn || temporal.isCompleted) return 'SERVICE_ENDED';
  if (temporal.isOverdue) return 'OVERDUE';
  if (temporal.isClosingSoon) return 'CLOSING_SOON';
  return 'ON_TRACK';
}

/** Short label of the service window for a tray card: "Día 61 de 90", "Faltan 3 días", "Vencida hace 6 días". */
export function trayTimeLabel(order: ServiceOrder): string {
  const temporal = computeServiceOrderTemporalStatus(order);
  if (temporal.isBullsWithdrawn) {
    return order.suggested_diagnosis_date ? `Tactar desde ${formatDay(order.suggested_diagnosis_date)}` : 'Servicio terminado';
  }
  const { daysRemaining, daysInService } = temporal;
  if (temporal.isOverdue) {
    if (daysRemaining !== null && daysRemaining < 0) {
      const days = Math.abs(daysRemaining);
      return `Vencida hace ${days} día${days === 1 ? '' : 's'}`;
    }
    return 'Ventana cumplida';
  }
  if (temporal.isClosingSoon && daysRemaining !== null) return `Faltan ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`;
  // An AI order has no window (E10): only the day of service.
  if (daysInService !== null) return daysRemaining === null ? `Día ${daysInService}` : `Día ${daysInService} de 90`;
  return 'En servicio';
}

export interface TrayFilters {
  search: string;
  phase: TrayPhase | 'ALL';
  deadline: TrayDeadline | 'ALL';
}

export const EMPTY_TRAY_FILTERS: TrayFilters = { search: '', phase: 'ALL', deadline: 'ALL' };

/** Matches an order against the search text: its code or its batch name. */
export function matchesTraySearch(order: ServiceOrder, batchName: string, search: string): boolean {
  const needle = search.trim().toLowerCase();
  return !needle || order.code.toLowerCase().includes(needle) || batchName.toLowerCase().includes(needle);
}

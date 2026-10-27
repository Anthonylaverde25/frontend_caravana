import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { formatDay } from './reproductiveVerdict';
import { hasServiceEnded } from './serviceOrderStatus';

export type TemporalStatusKind = 'ON_TRACK' | 'CLOSING_SOON' | 'OVERDUE' | 'BULLS_WITHDRAWN' | 'COMPLETED';

export interface ServiceOrderTemporalStatus {
  daysInService: number | null;
  daysRemaining: number | null;
  statusKind: TemporalStatusKind;
  label: string;
  shortLabel: string;
  chipColor: 'success' | 'warning' | 'error' | 'primary' | 'default';
  isClosingSoon: boolean;
  isOverdue: boolean;
  isCompleted: boolean;
  /** Bulls withdrawn: the service ended, the order stays open until its diagnosis is complete. */
  isBullsWithdrawn: boolean;
  effectiveEndDate: string | null;
  effectivePlannedEndDate: string | null;
}

/**
 * Computes temporal service window metrics according to the canonical 90-day Carrillo standard.
 * Handles dual directionality: pro-active countdown alerts & recorded completions.
 */
export function computeServiceOrderTemporalStatus(
  order: ServiceOrder | null | undefined,
  batchPlannedStartDate?: string | null,
  batchPlannedEndDate?: string | null
): ServiceOrderTemporalStatus {
  if (!order) {
    return {
      daysInService: null,
      daysRemaining: null,
      statusKind: 'ON_TRACK',
      label: 'Sin datos',
      shortLabel: '—',
      chipColor: 'default',
      isClosingSoon: false,
      isOverdue: false,
      isCompleted: false,
      isBullsWithdrawn: false,
      effectiveEndDate: null,
      effectivePlannedEndDate: null,
    };
  }

  // Closed only by its diagnosis: withdrawing the bulls ends the service, not the order.
  const isCompleted = order.status === 'SUCCESS';
  // The service ended: the torada left, or an AI service was ended (semen S-B).
  const isBullsWithdrawn = hasServiceEnded(order.status);
  const endedWord = order.service_method === 'AI' ? 'Servicio terminado' : 'Toros retirados';

  // 1. Resolve start date
  const startStr = order.actual_start_date || order.planned_start_date || batchPlannedStartDate;
  const startDate = startStr ? new Date(startStr) : null;

  // 2. Resolve actual end date if finished
  const endStr = order.actual_end_date || null;
  const endDate = endStr ? new Date(endStr) : null;

  // 3. Resolve planned end date (fallback to startDate + 90 days if missing)
  let plannedEndStr = order.planned_end_date || batchPlannedEndDate || null;
  if (!plannedEndStr && startDate) {
    const fallbackDate = new Date(startDate.getTime());
    fallbackDate.setDate(fallbackDate.getDate() + 90);
    plannedEndStr = fallbackDate.toISOString().slice(0, 10);
  }
  const plannedEndDate = plannedEndStr ? new Date(plannedEndStr) : null;

  // 4. Calculate days in service
  let daysInService: number | null = null;
  if (startDate) {
    const referenceEnd = endDate || new Date();
    const diffMs = referenceEnd.getTime() - startDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysInService = days >= 0 ? days : 0;
  }

  // 5. Closed by its diagnosis
  if (isCompleted) {
    const rate = order.final_pregnancy_rate;
    return {
      daysInService,
      daysRemaining: null,
      statusKind: 'COMPLETED',
      label: rate !== null && rate !== undefined ? `Diagnosticada · preñez ${rate.toFixed(1)}%` : 'Diagnosticada',
      shortLabel: 'Diagnosticada',
      chipColor: 'success',
      isClosingSoon: false,
      isOverdue: false,
      isCompleted: true,
      isBullsWithdrawn: false,
      effectiveEndDate: endStr,
      effectivePlannedEndDate: plannedEndStr,
    };
  }

  // 5b. Bulls withdrawn, the order still open (diagnosis suggested from withdrawal + 45 days)
  if (isBullsWithdrawn) {
    const suggested = order.suggested_diagnosis_date ?? null;
    const overdue = suggested !== null && suggested < new Date().toISOString().slice(0, 10);
    return {
      daysInService,
      daysRemaining: null,
      statusKind: 'BULLS_WITHDRAWN',
      label: suggested ? `${endedWord} · tactar desde ${formatDay(suggested)}` : endedWord,
      shortLabel: order.service_method === 'AI' ? 'Servicio terminado' : 'Torada retirada',
      chipColor: overdue ? 'warning' : 'primary',
      isClosingSoon: false,
      isOverdue: false,
      isCompleted: false,
      isBullsWithdrawn: true,
      effectiveEndDate: endStr,
      effectivePlannedEndDate: plannedEndStr,
    };
  }

  // 5c. AI without a planned end (semen S-B, E10): no 90-day window, no withdrawal alerts.
  if (order.service_method === 'AI' && !order.planned_end_date) {
    return {
      daysInService,
      daysRemaining: null,
      statusKind: 'ON_TRACK',
      label: daysInService !== null ? `Inseminación · día ${daysInService}` : 'Inseminación',
      shortLabel: daysInService !== null ? `Día ${daysInService}` : 'En servicio',
      chipColor: 'primary',
      isClosingSoon: false,
      isOverdue: false,
      isCompleted: false,
      isBullsWithdrawn: false,
      effectiveEndDate: endStr,
      effectivePlannedEndDate: null,
    };
  }

  // 6. Calculate days remaining against planned end date
  let daysRemaining: number | null = null;
  if (plannedEndDate) {
    const today = new Date();
    // Normalize time to midnight for calendar day calculation
    today.setHours(0, 0, 0, 0);
    const target = new Date(plannedEndDate.getTime());
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = diffDays;
  }

  // 7. Determine status kind
  const isOverdue =
    (daysRemaining !== null && daysRemaining <= 0) ||
    (daysInService !== null && daysInService >= 90);

  const isClosingSoon = !isOverdue && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  let statusKind: TemporalStatusKind = 'ON_TRACK';
  let label = 'En servicio';
  let shortLabel = 'En servicio';
  let chipColor: 'success' | 'warning' | 'error' | 'primary' | 'default' = 'primary';

  if (isOverdue) {
    statusKind = 'OVERDUE';
    chipColor = 'error';
    if (daysRemaining !== null && daysRemaining < 0) {
      const overDays = Math.abs(daysRemaining);
      label = `Ventana cumplida (+${overDays}d): Retiro obligatorio`;
      shortLabel = `Vencido (+${overDays}d)`;
    } else {
      label = 'Ventana de 90d cumplida: Retiro de toros requerido';
      shortLabel = 'Retiro requerido';
    }
  } else if (isClosingSoon) {
    statusKind = 'CLOSING_SOON';
    chipColor = 'warning';
    label = `Próximo al cierre: Faltan ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`;
    shortLabel = `Faltan ${daysRemaining}d`;
  } else {
    statusKind = 'ON_TRACK';
    chipColor = 'primary';
    if (daysRemaining !== null && daysInService !== null) {
      label = `Día ${daysInService} de 90 (Faltan ${daysRemaining}d)`;
      shortLabel = `${daysInService}d / 90d`;
    } else if (daysInService !== null) {
      label = `${daysInService} días transcurridos`;
      shortLabel = `${daysInService} días`;
    }
  }

  return {
    daysInService,
    daysRemaining,
    statusKind,
    label,
    shortLabel,
    chipColor,
    isClosingSoon,
    isOverdue,
    isCompleted: false,
    isBullsWithdrawn: false,
    effectiveEndDate: endStr,
    effectivePlannedEndDate: plannedEndStr,
  };
}

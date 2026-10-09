import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

export type TemporalStatusKind = 'ON_TRACK' | 'CLOSING_SOON' | 'OVERDUE' | 'COMPLETED';

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
      effectiveEndDate: null,
      effectivePlannedEndDate: null,
    };
  }

  const isCompleted = order.status === 'SUCCESS' || order.status === 'COMPLETED' || Boolean(order.actual_end_date);

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

  // 5. If already completed, status is locked to COMPLETED
  if (isCompleted) {
    return {
      daysInService,
      daysRemaining: null,
      statusKind: 'COMPLETED',
      label: `Servicio Finalizado (${endStr || 'Torada en descanso'})`,
      shortLabel: 'Finalizado',
      chipColor: 'success',
      isClosingSoon: false,
      isOverdue: false,
      isCompleted: true,
      effectiveEndDate: endStr,
      effectivePlannedEndDate: plannedEndStr,
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
    effectiveEndDate: endStr,
    effectivePlannedEndDate: plannedEndStr,
  };
}

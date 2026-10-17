import { useMemo, useState } from 'react';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';
import {
  EMPTY_TRAY_FILTERS,
  getTrayDeadline,
  groupOrdersForTray,
  matchesTraySearch,
  TRAY_DEADLINES,
  TRAY_PHASES,
  type TrayDeadline,
  type TrayFilters,
  type TrayPhase,
} from '../../utils/diagnosisTray';

/**
 * Search, phase and deadline filters of the diagnosis tray. Each filter counts its options over
 * the orders the OTHER filters let through, so no option reads zero only because of itself.
 */
export function useDiagnosisTrayFilters(orders: ServiceOrder[], batchNameOf: (order: ServiceOrder) => string) {
  const [filters, setFilters] = useState<TrayFilters>(EMPTY_TRAY_FILTERS);

  const result = useMemo(() => {
    const rows = orders
      .filter((order) => getServiceOrderPhase(order).isOpen)
      .map((order) => ({
        order,
        phase: getServiceOrderPhase(order).phase as TrayPhase,
        deadline: getTrayDeadline(order),
        matchesSearch: matchesTraySearch(order, batchNameOf(order), filters.search),
      }));

    const byPhase = (row: (typeof rows)[number]) => filters.phase === 'ALL' || row.phase === filters.phase;
    const byDeadline = (row: (typeof rows)[number]) => filters.deadline === 'ALL' || row.deadline === filters.deadline;

    const phaseBase = rows.filter((row) => row.matchesSearch && byDeadline(row));
    const deadlineBase = rows.filter((row) => row.matchesSearch && byPhase(row));
    const visible = phaseBase.filter(byPhase);

    const phaseCounts = Object.fromEntries(
      TRAY_PHASES.map((phase) => [phase, phaseBase.filter((row) => row.phase === phase).length])
    ) as Record<TrayPhase, number>;
    const deadlineCounts = Object.fromEntries(
      TRAY_DEADLINES.map((deadline) => [deadline, deadlineBase.filter((row) => row.deadline === deadline).length])
    ) as Record<TrayDeadline, number>;

    return {
      sections: groupOrdersForTray(visible.map((row) => row.order)),
      phaseCounts,
      phaseTotal: phaseBase.length,
      deadlineCounts,
      deadlineTotal: deadlineBase.length,
      visibleCount: visible.length,
      totalCount: rows.length,
    };
  }, [orders, batchNameOf, filters]);

  const activeCount = (filters.search.trim() ? 1 : 0) + (filters.phase !== 'ALL' ? 1 : 0) + (filters.deadline !== 'ALL' ? 1 : 0);

  return {
    filters,
    ...result,
    activeCount,
    setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
    setPhase: (phase: TrayFilters['phase']) => setFilters((f) => ({ ...f, phase })),
    setDeadline: (deadline: TrayFilters['deadline']) => setFilters((f) => ({ ...f, deadline })),
    reset: () => setFilters(EMPTY_TRAY_FILTERS),
  };
}

export type DiagnosisTrayFiltersModel = ReturnType<typeof useDiagnosisTrayFilters>;

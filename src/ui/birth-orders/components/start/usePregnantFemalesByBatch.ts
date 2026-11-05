import { useMemo } from 'react';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { ServiceOrderHold } from '@/features/birth-orders/hooks/useBirthOrders';
import type { BirthRollFemale } from '../grid/birthRollTypes';
import { countByServiceOrder, type ServiceHeldOrder } from './ServiceHeldNotice';

/** The pregnant females of one batch: the ones an order may take, and the ones an open order holds. */
export interface FemaleBatchGroup {
  key: string;
  batchId: number | null;
  name: string;
  females: BirthRollFemale[];
  /** Females of this batch already held by an open birth order, by order code. */
  committed: { code: string; count: number }[];
  /** Females of this batch whose service order is not closed yet: their calving season has not started. */
  heldByService: ServiceHeldOrder[];
}

/** Stable across renders, so the grouping is not recomputed while the holds load. */
export const NO_HOLDS = new Map<number, ServiceOrderHold>();

export const femaleFromCaravan = (caravan: Caravan): BirthRollFemale => ({
  caravanId: caravan.id,
  identification: caravan.identification,
  categoryLabel: caravan.category,
  batchName: caravan.batch_name,
  dueDate: caravan.active_gestation?.estimated_due_date ?? null,
  stage: caravan.active_gestation?.gestation_stage ?? null,
  sires: caravan.active_gestation?.sires ?? [],
  overdueReportedAt: caravan.active_gestation?.calving_overdue_reported_at ?? null
});

/** Every pregnant female of the company, as the grid and the selector show her. */
export const pregnantFemalesOf = (caravans: Caravan[]): Caravan[] =>
  caravans.filter((c) => c.sex === 'H' && c.active_gestation != null);

/**
 * Pregnant females grouped by their current batch, soonest due first, so a whole batch — or the head
 * of the calving season — can be chosen at once. Females held by an open birth order are only
 * counted: a female cannot be in two. So are the ones whose service order is not closed yet.
 */
export function usePregnantFemalesByBatch(
  caravans: Caravan[],
  committed: Map<number, string>,
  keep: number[] = [],
  heldByService: Map<number, ServiceOrderHold> = NO_HOLDS
): FemaleBatchGroup[] {
  return useMemo(() => {
    const kept = new Set(keep);
    const groups = new Map<string, FemaleBatchGroup>();
    const committedByGroup = new Map<string, Map<string, number>>();
    const heldByGroup = new Map<string, number[]>();

    pregnantFemalesOf(caravans).forEach((caravan) => {
      const key = caravan.batch_id != null ? `b${caravan.batch_id}` : 'none';

      if (!groups.has(key)) {
        groups.set(key, { key, batchId: caravan.batch_id, name: caravan.batch_name ?? 'Sin lote', females: [], committed: [], heldByService: [] });
        committedByGroup.set(key, new Map());
        heldByGroup.set(key, []);
      }

      const code = committed.get(caravan.id);

      if (heldByService.has(caravan.id) && !kept.has(caravan.id)) {
        heldByGroup.get(key)!.push(caravan.id);
      } else if (code && !kept.has(caravan.id)) {
        const codes = committedByGroup.get(key)!;
        codes.set(code, (codes.get(code) ?? 0) + 1);
      } else {
        groups.get(key)!.females.push(femaleFromCaravan(caravan));
      }
    });

    return [...groups.values()]
      .map((group) => ({
        ...group,
        females: [...group.females].sort(
          (a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || a.identification.localeCompare(b.identification)
        ),
        committed: [...committedByGroup.get(group.key)!.entries()].map(([code, count]) => ({ code, count })),
        heldByService: countByServiceOrder(heldByGroup.get(group.key)!, heldByService)
      }))
      .sort((a, b) => (a.batchId == null ? 1 : b.batchId == null ? -1 : a.name.localeCompare(b.name)));
  }, [caravans, committed, keep, heldByService]);
}

import { useMemo } from 'react';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { BirthRollFemale } from '../grid/birthRollTypes';

/** The pregnant females of one batch: the ones an order may take, and the ones an open order holds. */
export interface FemaleBatchGroup {
  key: string;
  batchId: number | null;
  name: string;
  females: BirthRollFemale[];
  /** Females of this batch already held by an open birth order, by order code. */
  committed: { code: string; count: number }[];
}

export const femaleFromCaravan = (caravan: Caravan): BirthRollFemale => ({
  caravanId: caravan.id,
  identification: caravan.identification,
  categoryLabel: caravan.category,
  batchName: caravan.batch_name,
  dueDate: caravan.active_gestation?.estimated_due_date ?? null,
  stage: caravan.active_gestation?.gestation_stage ?? null,
  sires: caravan.active_gestation?.sires ?? []
});

/** Every pregnant female of the company, as the grid and the selector show her. */
export const pregnantFemalesOf = (caravans: Caravan[]): Caravan[] =>
  caravans.filter((c) => c.sex === 'H' && c.active_gestation != null);

/**
 * Pregnant females grouped by their current batch, soonest due first, so a whole batch — or the head
 * of the calving season — can be chosen at once. Females held by an open birth order are only
 * counted: a female cannot be in two.
 */
export function usePregnantFemalesByBatch(caravans: Caravan[], committed: Map<number, string>, keep: number[] = []): FemaleBatchGroup[] {
  return useMemo(() => {
    const kept = new Set(keep);
    const groups = new Map<string, FemaleBatchGroup>();
    const committedByGroup = new Map<string, Map<string, number>>();

    pregnantFemalesOf(caravans).forEach((caravan) => {
      const key = caravan.batch_id != null ? `b${caravan.batch_id}` : 'none';

      if (!groups.has(key)) {
        groups.set(key, { key, batchId: caravan.batch_id, name: caravan.batch_name ?? 'Sin lote', females: [], committed: [] });
        committedByGroup.set(key, new Map());
      }

      const code = committed.get(caravan.id);

      if (code && !kept.has(caravan.id)) {
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
        committed: [...committedByGroup.get(group.key)!.entries()].map(([code, count]) => ({ code, count }))
      }))
      .sort((a, b) => (a.batchId == null ? 1 : b.batchId == null ? -1 : a.name.localeCompare(b.name)));
  }, [caravans, committed, keep]);
}

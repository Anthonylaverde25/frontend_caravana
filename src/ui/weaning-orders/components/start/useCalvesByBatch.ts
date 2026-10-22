import { useMemo } from 'react';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';

/** The calves at foot of one batch: the ones an order may take, and the ones an open order holds. */
export interface CalfBatchGroup {
  key: string;
  batchId: number | null;
  name: string;
  calves: BirthHistoryRecord[];
  /** Calves of this batch already held by an open order, by order code. */
  committed: { code: string; count: number }[];
  /** Calves still waiting for their tag: weaning needs it, so they are offered to tag first. */
  untagged: BirthHistoryRecord[];
}

/** The batch a calf at foot is grouped under. */
export const calfGroupKey = (record: BirthHistoryRecord): string => (record.calf_batch_id != null ? `b${record.calf_batch_id}` : 'none');

/**
 * Calves at foot grouped by their current batch, so a whole batch can be chosen at once. Calves in
 * `excludeIds` (already on the order) are left out; calves held by an open order are only counted —
 * except by `heldBy`, the order being executed, whose calves are the ones offered.
 */
export function useCalvesByBatch(births: BirthHistoryRecord[], excludeIds: number[] = [], heldBy: string | null = null): CalfBatchGroup[] {
  return useMemo(() => {
    const excluded = new Set(excludeIds);
    const groups = new Map<string, CalfBatchGroup>();
    const committedByGroup = new Map<string, Map<string, number>>();

    births.forEach((record) => {
      if (!record.is_nursing || excluded.has(record.calf_id)) return;

      const key = calfGroupKey(record);

      if (!groups.has(key)) {
        groups.set(key, { key, batchId: record.calf_batch_id, name: record.calf_batch_name ?? 'Sin lote', calves: [], committed: [], untagged: [] });
        committedByGroup.set(key, new Map());
      }

      if (!record.calf_identification) {
        groups.get(key)!.untagged.push(record);
      } else if (record.open_order_code && record.open_order_code !== heldBy) {
        const codes = committedByGroup.get(key)!;
        codes.set(record.open_order_code, (codes.get(record.open_order_code) ?? 0) + 1);
      } else {
        groups.get(key)!.calves.push(record);
      }
    });

    return [...groups.values()]
      .map((group) => ({
        ...group,
        calves: [...group.calves].sort((a, b) => a.calf_identification.localeCompare(b.calf_identification)),
        committed: [...committedByGroup.get(group.key)!.entries()].map(([code, count]) => ({ code, count }))
      }))
      .sort((a, b) => (a.batchId == null ? 1 : b.batchId == null ? -1 : a.name.localeCompare(b.name)));
  }, [births, excludeIds, heldBy]);
}

import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

export interface Lser01Roster {
  /** Own Cría batches without a running service: the ones that can start one. */
  eligibleBatches: Batch[];
  batch: Batch | null;
  /** Empty females of the batch, pre-printed on the sheet (pregnant ones are not serviced). */
  females: Caravan[];
  isLoading: boolean;
}

/**
 * Batch and females behind an LSER-01 sheet. The sheet is printed from an existing batch, so its
 * rows come pre-filled with the females that are in it today.
 */
export function useLser01Roster(batchId: number | null): Lser01Roster {
  const { activeCompanyId } = useCompany();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches(undefined, undefined, 'own');
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(batchId ? activeCompanyId : null, 'own');

  const eligibleBatches = useMemo(
    () => batches.filter((b) => b.isCria() && !b.provider_id && !b.hasActiveService()),
    [batches]
  );

  const batch = useMemo(() => batches.find((b) => b.id === batchId) ?? null, [batches, batchId]);

  const females = useMemo(() => {
    if (!batchId) return [];
    return caravans
      .filter((c: any) => c.batch_id === batchId && (c.sex === 'H' || c.sex === 'F') && !c.active_gestation)
      .sort((a: any, b: any) => String(a.identification).localeCompare(String(b.identification)));
  }, [caravans, batchId]);

  return { eligibleBatches, batch, females, isLoading: isLoadingBatches || isLoadingCaravans };
}

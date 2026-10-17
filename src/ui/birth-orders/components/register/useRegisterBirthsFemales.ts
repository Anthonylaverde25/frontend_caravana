import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useOpenBirthOrderMothers } from '@/features/birth-orders/hooks/useBirthOrders';
import type { BirthRollFemale } from '../grid/birthRollTypes';
import { femaleFromCaravan, pregnantFemalesOf } from '../start/usePregnantFemalesByBatch';

export interface RegisterBirthsFemales {
  /** The pregnant females of the sheet, by batch and soonest due first. */
  females: BirthRollFemale[];
  /** The batch's name when the sheet is scoped to one. */
  batchName: string | null;
  batchCount: number;
  isLoading: boolean;
}

const byBatchThenDue = (a: BirthRollFemale, b: BirthRollFemale): number =>
  (a.batchName ?? '').localeCompare(b.batchName ?? '') ||
  (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
  a.identification.localeCompare(b.identification);

/**
 * The pregnant females of the sheet: the ones of one batch (Monitoreo Gestacional) or of every batch
 * ("Registrar partos" from the orders list). Scoped by the batch, never only preselected. A female an
 * open order holds is loaded like any other and carries that order's code: her calving goes there.
 */
export function useRegisterBirthsFemales(batchId: number | null): RegisterBirthsFemales {
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);
  const { data: committed = new Map<number, string>(), isLoading: isLoadingCommitted } = useOpenBirthOrderMothers();
  const { data: batch } = useBatch(batchId ?? undefined);

  return useMemo(() => {
    const females = pregnantFemalesOf(caravans)
      .filter((caravan) => batchId == null || caravan.batch_id === batchId)
      .map((caravan) => ({ ...femaleFromCaravan(caravan), openOrderCode: committed.get(caravan.id) ?? null }))
      .sort(byBatchThenDue);

    return {
      females,
      batchName: batchId == null ? null : (batch?.name ?? females[0]?.batchName ?? `Lote ${batchId}`),
      batchCount: new Set(females.map((f) => f.batchName ?? '')).size,
      isLoading: isLoading || isLoadingCommitted
    };
  }, [caravans, committed, batch, batchId, isLoading, isLoadingCommitted]);
}

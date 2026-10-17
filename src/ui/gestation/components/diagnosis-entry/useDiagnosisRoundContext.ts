import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { ServiceOrder, useServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import type { BatchOption } from './DiagnosisEntryRow';

/**
 * What a diagnosis round of an order needs around the table: the verdicts of every female, the
 * bulls (to confirm a sire) and the own batches an empty female can leave to.
 */
export function useDiagnosisRoundContext(order: ServiceOrder | null) {
  const { activeCompanyId } = useCompany();
  const diagnosis = useServiceOrderDiagnosis(order?.id);
  const { data: caravans = [] } = useCaravans(activeCompanyId);
  const { data: batches = [] } = useBatches(undefined, undefined, 'own');

  const bulls = useMemo(() => {
    const ids = order?.all_male_caravan_ids?.length ? order.all_male_caravan_ids : (order?.male_caravan_ids ?? []);
    const byId = new Map(caravans.map((c) => [c.id, c.identification]));
    return ids.map((id) => ({ id, identification: byId.get(id) ?? `#${id}` }));
  }, [order, caravans]);

  const activeBullIds = useMemo(() => {
    if (!order) return [];
    if (order.male_details?.length) {
      return order.male_details.filter((d) => d.status === 'ACTIVE').map((d) => d.male_caravan_id);
    }
    return order.active_male_caravan_ids ?? order.male_caravan_ids ?? [];
  }, [order]);

  const destinations: BatchOption[] = useMemo(
    () =>
      batches
        .filter((b) => b.isActive() && !b.provider_id && !b.is_system && b.id !== order?.batch_id)
        .map((b) => ({ id: b.id, name: b.name })),
    [batches, order?.batch_id]
  );

  return {
    diagnosis: diagnosis.data ?? null,
    isLoading: diagnosis.isLoading,
    bulls,
    activeBullIds,
    singleBullId: bulls.length === 1 ? bulls[0].id : null,
    destinations,
    caravans,
  };
}

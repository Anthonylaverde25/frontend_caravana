import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';

const NON_PRODUCTIVE_ACTIVITY = 'INTERNAL';

export interface TransferFormBatch {
  id: number;
  name: string;
  count: number;
}

export interface TransferFormActivity {
  id: number;
  name: string;
  batches: TransferFormBatch[];
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/**
 * What the "Nueva orden de transferencia" dialog can offer, one activity at a time.
 *
 * Source: only batches that hold animals, grouped under their activity, and only activities that
 * have at least one of them. Destination: the productive activities with every batch they have,
 * empty ones included — an empty batch is a perfectly good place to receive animals.
 */
export function useTransferOrderFormOptions() {
  const { activeCompanyId } = useCompany();
  const { data: activities = [], isLoading } = useActivities(activeCompanyId);

  return useMemo(() => {
    const enabled = activities.filter((activity) => activity.isEnabled !== false);
    const toOption = (activity: (typeof enabled)[number], batches: TransferFormBatch[]): TransferFormActivity => ({
      id: Number(activity.id),
      name: activity.name,
      batches: [...batches].sort(byName)
    });
    const batchesOf = (activity: (typeof enabled)[number]): TransferFormBatch[] =>
      (activity.batches ?? []).map((batch) => ({ id: Number(batch.id), name: batch.name, count: batch.count }));

    const sourceActivities = enabled
      .map((activity) => toOption(activity, batchesOf(activity).filter((batch) => batch.count > 0)))
      .filter((activity) => activity.batches.length > 0)
      .sort(byName);

    const destinationActivities = enabled
      .filter((activity) => activity.code !== NON_PRODUCTIVE_ACTIVITY)
      .map((activity) => toOption(activity, batchesOf(activity)))
      .sort(byName);

    return { sourceActivities, destinationActivities, isLoading };
  }, [activities, isLoading]);
}

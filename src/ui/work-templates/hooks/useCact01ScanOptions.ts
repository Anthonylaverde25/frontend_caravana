import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import type { Cact01BatchOption } from './useCact01Destinations';

const NON_PRODUCTIVE_ACTIVITY = 'INTERNAL';

/**
 * The catalogues the CACT-01 review screen needs to resolve a destination: every batch
 * it could point at, the activities a new batch can be born into, and the batch types.
 *
 * Kept out of WorkTemplateScanView on purpose. That view is already 2400 lines, and the
 * whole point of the CACT-01 branch living in components of its own is that the view
 * only gains a `case`.
 */
export function useCact01ScanOptions() {
  const { activeCompanyId } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: batchTypes = [] } = useBatchTypes();

  const productiveActivities = useMemo(
    () =>
      activities
        .filter((activity) => activity.isEnabled !== false && activity.code !== NON_PRODUCTIVE_ACTIVITY)
        .map((activity) => ({ id: activity.id, name: activity.name, code: activity.code })),
    [activities]
  );

  const batches = useMemo<Cact01BatchOption[]>(
    () =>
      activities
        .filter((activity) => activity.isEnabled !== false)
        .flatMap((activity) =>
          (activity.batches ?? []).map((batch) => ({
            id: batch.id,
            name: batch.name,
            activityId: activity.id,
            activityName: activity.name,
            isConfined: batch.isConfined,
          }))
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [activities]
  );

  /** Only batches that actually hold animals can be the source of a movement. */
  const sourceBatchOptions = useMemo(
    () =>
      activities
        .filter((activity) => activity.isEnabled !== false)
        .flatMap((activity) =>
          (activity.batches ?? []).map((batch) => ({
            id: batch.id,
            name: batch.name,
            activityName: activity.name,
            count: batch.count,
          }))
        )
        .filter((batch) => batch.count > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [activities]
  );

  return { activities: productiveActivities, batchTypes, batches, sourceBatchOptions };
}

export type Cact01ScanOptions = ReturnType<typeof useCact01ScanOptions>;

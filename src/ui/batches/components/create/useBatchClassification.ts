import { useEffect, useMemo } from 'react';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';

interface UseBatchClassificationArgs {
  open: boolean;
  activityId: number | undefined;
  batchTypeId: number | undefined;
  setActivityId: (id: number) => void;
  setBatchTypeId: (id: number) => void;
  /**
   * Creates a batch of this catalogue type only (e.g. WEANING): the type and its activity are
   * fixed and shown, not chosen.
   */
  batchTypeCode?: string;
}

/**
 * Activity, batch type and management system of a batch being created: the catalogue rules every
 * creation dialog follows (own batches and the external batch of an entry order).
 */
export function useBatchClassification({
  open,
  activityId,
  batchTypeId,
  setActivityId,
  setBatchTypeId,
  batchTypeCode
}: UseBatchClassificationArgs) {
  const { activeCompanyId } = useCompany();
  const { data: activities = [], isLoading: isLoadingActivities } = useActivities(activeCompanyId);
  const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();

  const lockedType = useMemo(
    () => (batchTypeCode ? batchTypes.find((t) => t.code === batchTypeCode) : undefined),
    [batchTypes, batchTypeCode]
  );

  const selectedActivity = useMemo(() => activities.find((a) => a.id === activityId), [activities, activityId]);

  // The management system is a fact of the batch, not of the stage: a Cría batch can
  // be penned just like a Recría one. It is asked for in every productive activity.
  // INTERNAL is excluded because it is not a stage, it is where the system's own
  // batches live, and it is not offered by the picker anyway.
  const declaresManagement = Boolean(selectedActivity) && selectedActivity?.code !== 'INTERNAL';

  // Catalogue rules, resolved in memory: the catalogue is twelve rows cached for an
  // hour, so changing activity re-filters instantly without a refetch, and the other
  // dialogs that resolve a type by code keep reading the unfiltered list.
  //
  // Two rules apply. The type must fit the activity, unless it is cross-cutting; and
  // it must be one that is picked by hand at all, which is why the reserve batch type
  // does not show up here even though it is cross-cutting.
  const filteredBatchTypes = useMemo(() => {
    const selectable = batchTypes.filter((t) => t.is_selectable !== false);

    if (!activityId) return selectable;

    return selectable.filter((t) => t.activity_id === activityId || t.activity_id == null);
  }, [batchTypes, activityId]);

  // Visible preselection of the first compatible type, preferring OPERATIONAL when it
  // is available: whoever does not want to classify does not have to. If the type
  // already chosen is still compatible it is respected.
  useEffect(() => {
    if (batchTypeCode || filteredBatchTypes.length === 0) return;

    const stillCompatible = filteredBatchTypes.some((t) => t.id === batchTypeId);

    if (stillCompatible) return;

    const fallback = filteredBatchTypes.find((t) => t.code === 'OPERATIONAL') || filteredBatchTypes[0];

    setBatchTypeId(fallback.id);
  }, [filteredBatchTypes, batchTypeId, setBatchTypeId, batchTypeCode]);

  // A fixed type brings its own activity.
  useEffect(() => {
    if (!open || !lockedType) return;

    setBatchTypeId(lockedType.id);

    if (lockedType.activity_id) setActivityId(lockedType.activity_id);
  }, [open, lockedType, setActivityId, setBatchTypeId]);

  // Automatically preselect the company's initial activity, unless one is already chosen
  // (a draft being edited keeps the one it declared).
  useEffect(() => {
    if (batchTypeCode || activities.length === 0 || activityId) return;

    const initialActivity = activities.find((a) => a.isEnabled && a.isInitial) || activities.find((a) => a.isEnabled);

    if (initialActivity) setActivityId(initialActivity.id);
  }, [activities, activityId, setActivityId, batchTypeCode]);

  return {
    activities,
    isLoadingActivities,
    filteredBatchTypes,
    isLoadingBatchTypes,
    lockedType,
    selectedActivity,
    declaresManagement
  };
}

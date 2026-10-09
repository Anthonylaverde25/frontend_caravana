import { useState, useMemo, useCallback } from 'react';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Activity } from '@/core/activities/domain/entities/Activity';
import { BatchType } from '@/core/batch-types/domain/entities/BatchType';
import { Farm } from '@/core/suppliers/domain/entities/Farm';
import {
  BatchFiltersState,
  BatchFilterSummaryKPIs,
  BatchOptionCount,
  BatchOperationalStatus,
  BatchLifecycleStatus,
} from './types';

export const INITIAL_BATCH_FILTERS: BatchFiltersState = {
  search: '',
  activityId: 'ALL',
  batchTypeId: 'ALL',
  farmId: 'ALL',
  lifecycleStatus: 'ALL',
  operationalStatus: 'ALL',
};

interface UseBatchFiltersArgs {
  batches?: Batch[];
  activities?: Activity[];
  batchTypes?: BatchType[];
  farms?: Farm[];
}

export function useBatchFilters({
  batches = [],
  activities = [],
  batchTypes = [],
  farms = [],
}: UseBatchFiltersArgs) {
  const [filters, setFilters] = useState<BatchFiltersState>(INITIAL_BATCH_FILTERS);

  // Normalize safe arrays
  const safeBatches = useMemo(() => (Array.isArray(batches) ? batches : []), [batches]);
  const safeActivities = useMemo(() => (Array.isArray(activities) ? activities : []), [activities]);
  const safeBatchTypes = useMemo(() => (Array.isArray(batchTypes) ? batchTypes : []), [batchTypes]);
  const safeFarms = useMemo(() => (Array.isArray(farms) ? farms : []), [farms]);

  // Setters
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setActivityId = useCallback((activityId: number | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      activityId,
      // If the currently selected batch type is incompatible with the newly selected activity, reset it
      batchTypeId: 'ALL',
    }));
  }, []);

  const setBatchTypeId = useCallback((batchTypeId: number | 'ALL') => {
    setFilters((prev) => ({ ...prev, batchTypeId }));
  }, []);

  const setFarmId = useCallback((farmId: number | 'ALL') => {
    setFilters((prev) => ({ ...prev, farmId }));
  }, []);

  const setLifecycleStatus = useCallback((lifecycleStatus: BatchLifecycleStatus) => {
    setFilters((prev) => ({ ...prev, lifecycleStatus }));
  }, []);

  const setOperationalStatus = useCallback((operationalStatus: BatchOperationalStatus) => {
    setFilters((prev) => ({ ...prev, operationalStatus }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_BATCH_FILTERS);
  }, []);

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim() !== '') count += 1;
    if (filters.activityId !== 'ALL') count += 1;
    if (filters.batchTypeId !== 'ALL') count += 1;
    if (filters.farmId !== 'ALL') count += 1;
    if (filters.lifecycleStatus !== 'ALL') count += 1;
    if (filters.operationalStatus !== 'ALL') count += 1;
    return count;
  }, [filters]);

  // Dynamic Activity Options with batch counts
  const activityOptions = useMemo<BatchOptionCount[]>(() => {
    const countsMap = new Map<number, number>();
    safeBatches.forEach((b) => {
      if (b && b.activity_id) {
        countsMap.set(b.activity_id, (countsMap.get(b.activity_id) || 0) + 1);
      }
    });

    // Merge from catalogue or existing batches
    const options: BatchOptionCount[] = [];
    const seenIds = new Set<number>();

    safeActivities.forEach((act) => {
      if (!act) return;
      seenIds.add(act.id);
      options.push({
        id: act.id,
        name: act.name,
        code: act.code,
        count: countsMap.get(act.id) || 0,
      });
    });

    safeBatches.forEach((b) => {
      if (b && b.activity_id && !seenIds.has(b.activity_id)) {
        seenIds.add(b.activity_id);
        options.push({
          id: b.activity_id,
          name: b.activity_name || `Actividad #${b.activity_id}`,
          count: countsMap.get(b.activity_id) || 1,
        });
      }
    });

    return options.sort((a, b) => b.count - a.count);
  }, [safeActivities, safeBatches]);

  // Dynamic Batch Type Options (filtered if an activity is selected)
  const batchTypeOptions = useMemo<BatchOptionCount[]>(() => {
    const countsMap = new Map<number, number>();
    safeBatches.forEach((b) => {
      if (b && b.batch_type_id) {
        // If an activity is chosen, only count batches belonging to that activity
        if (filters.activityId === 'ALL' || b.activity_id === filters.activityId) {
          countsMap.set(b.batch_type_id, (countsMap.get(b.batch_type_id) || 0) + 1);
        }
      }
    });

    const options: BatchOptionCount[] = [];
    const seenIds = new Set<number>();

    // Catalogue types
    const filteredCatalogue =
      filters.activityId === 'ALL'
        ? safeBatchTypes
        : safeBatchTypes.filter(
            (t) => t && (t.activity_id === filters.activityId || t.activity_id == null)
          );

    filteredCatalogue.forEach((bt) => {
      if (!bt) return;
      seenIds.add(bt.id);
      options.push({
        id: bt.id,
        name: bt.name,
        code: bt.code,
        count: countsMap.get(bt.id) || 0,
      });
    });

    // Also include any batch type present in the actual batches
    safeBatches.forEach((b) => {
      if (
        b &&
        b.batch_type_id &&
        !seenIds.has(b.batch_type_id) &&
        (filters.activityId === 'ALL' || b.activity_id === filters.activityId)
      ) {
        seenIds.add(b.batch_type_id);
        options.push({
          id: b.batch_type_id,
          name: b.batch_type_name || `Tipo #${b.batch_type_id}`,
          code: b.batch_type_code,
          count: countsMap.get(b.batch_type_id) || 1,
        });
      }
    });

    return options.sort((a, b) => b.count - a.count);
  }, [safeBatchTypes, safeBatches, filters.activityId]);

  // Dynamic Farm Options
  const farmOptions = useMemo<BatchOptionCount[]>(() => {
    const countsMap = new Map<number, number>();
    safeBatches.forEach((b) => {
      if (b && b.farm_id) {
        countsMap.set(b.farm_id, (countsMap.get(b.farm_id) || 0) + 1);
      }
    });

    const options: BatchOptionCount[] = [];
    const seenIds = new Set<number>();

    safeFarms.forEach((f) => {
      if (!f) return;
      seenIds.add(f.id);
      options.push({
        id: f.id,
        name: f.name,
        count: countsMap.get(f.id) || 0,
      });
    });

    safeBatches.forEach((b) => {
      if (b && b.farm_id && !seenIds.has(b.farm_id)) {
        seenIds.add(b.farm_id);
        options.push({
          id: b.farm_id,
          name: b.farm_name || `Establecimiento #${b.farm_id}`,
          count: countsMap.get(b.farm_id) || 1,
        });
      }
    });

    return options.filter((f) => f.count > 0 || safeFarms.length <= 5);
  }, [safeFarms, safeBatches]);

  // Filtering implementation
  const filteredBatches = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return safeBatches.filter((batch) => {
      if (!batch) return false;

      // 1. Text search
      if (term !== '') {
        const matchesName = batch.name?.toLowerCase().includes(term);
        const matchesActivity = batch.activity_name?.toLowerCase().includes(term);
        const matchesType = batch.batch_type_name?.toLowerCase().includes(term);
        const matchesFarm = batch.farm_name?.toLowerCase().includes(term);
        const matchesObs = batch.observaciones?.toLowerCase().includes(term);
        if (!matchesName && !matchesActivity && !matchesType && !matchesFarm && !matchesObs) {
          return false;
        }
      }

      // 2. Activity
      if (filters.activityId !== 'ALL') {
        if (batch.activity_id !== filters.activityId) return false;
      }

      // 3. Batch Type
      if (filters.batchTypeId !== 'ALL') {
        if (batch.batch_type_id !== filters.batchTypeId) return false;
      }

      // 4. Farm
      if (filters.farmId !== 'ALL') {
        if (batch.farm_id !== filters.farmId) return false;
      }

      // 5. Lifecycle status
      if (filters.lifecycleStatus === 'ACTIVE' && !batch.is_active) return false;
      if (filters.lifecycleStatus === 'INACTIVE' && batch.is_active) return false;

      // 6. Operational status
      if (filters.operationalStatus === 'IN_SERVICE') {
        const inService = Boolean(batch.is_in_service || batch.active_service_order);
        if (!inService) return false;
      } else if (filters.operationalStatus === 'WITH_ANIMALS') {
        if ((batch.caravans_count ?? 0) <= 0) return false;
      } else if (filters.operationalStatus === 'EMPTY') {
        if ((batch.caravans_count ?? 0) > 0) return false;
      }

      return true;
    });
  }, [safeBatches, filters]);

  // Summary KPIs based on filtered results
  const summaryKPIs = useMemo<BatchFilterSummaryKPIs>(() => {
    let totalHeads = 0;
    let inServiceCount = 0;
    let weighedCount = 0;
    let weightSum = 0;

    filteredBatches.forEach((b) => {
      if (!b) return;
      const heads = b.caravans_count ?? 0;
      totalHeads += heads;

      if (b.is_in_service || b.active_service_order) {
        inServiceCount += 1;
      }

      if (b.current_weight && b.current_weight > 0) {
        weightSum += b.current_weight;
        weighedCount += 1;
      }
    });

    const averageWeightKg = weighedCount > 0 ? Math.round(weightSum / weighedCount) : null;

    return {
      totalBatches: filteredBatches.length,
      totalHeads,
      inServiceCount,
      averageWeightKg,
    };
  }, [filteredBatches]);

  return {
    filters,
    setSearch,
    setActivityId,
    setBatchTypeId,
    setFarmId,
    setLifecycleStatus,
    setOperationalStatus,
    resetFilters,
    activeFiltersCount,
    activityOptions,
    batchTypeOptions,
    farmOptions,
    filteredBatches,
    summaryKPIs,
  };
}

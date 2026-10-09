export type BatchOperationalStatus = 'ALL' | 'IN_SERVICE' | 'WITH_ANIMALS' | 'EMPTY';

export type BatchLifecycleStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface BatchFiltersState {
  search: string;
  activityId: number | 'ALL';
  batchTypeId: number | 'ALL';
  farmId: number | 'ALL';
  lifecycleStatus: BatchLifecycleStatus;
  operationalStatus: BatchOperationalStatus;
}

export interface BatchOptionCount {
  id: number;
  name: string;
  count: number;
  code?: string;
}

export interface BatchFilterSummaryKPIs {
  totalBatches: number;
  totalHeads: number;
  inServiceCount: number;
  averageWeightKg: number | null;
}

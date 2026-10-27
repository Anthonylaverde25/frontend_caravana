import { useMemo, useState } from 'react';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { matchesTraySearch } from '../../../utils/diagnosisTray';
import {
  groupQueueOrders,
  isQueueOrder,
  queuePhaseOf,
  QUEUE_STAGES,
  STAGE_OF,
  type QueueStage,
} from '../../../utils/servicesQueue';

export interface QueueFilters {
  search: string;
  batchId: number | 'ALL';
  stage: QueueStage | 'ALL';
}

export interface StageTile {
  count: number;
  caption: string;
}

function activeBulls(order: ServiceOrder): number {
  if (order.male_details && order.male_details.length > 0) return order.male_details.filter((d) => d.status === 'ACTIVE').length;
  return order.active_male_caravan_ids?.length ?? order.male_caravan_ids.length;
}

/** What each tile of the phase strip says under its count, over the orders it counts. */
function stageCaption(stage: QueueStage, orders: ServiceOrder[]): string {
  switch (stage) {
    case 'DRAFT':
      return 'emitidas sin aprobar';
    case 'IN_SERVICE':
      return `${orders.reduce((sum, o) => sum + activeBulls(o), 0)} toros en lote`;
    case 'INSEMINATING': {
      const done = orders.reduce((sum, o) => sum + (o.insemination_summary?.inseminated ?? 0), 0);
      const total = orders.reduce((sum, o) => sum + (o.insemination_summary?.females ?? 0), 0);
      return `${done} de ${total} inseminadas`;
    }
    case 'TACTO': {
      const pending = orders.filter((o) => queuePhaseOf(o) === 'BULLS_WITHDRAWN').length;
      return `pendiente ${pending} · en curso ${orders.length - pending}`;
    }
    case 'READY_TO_CLOSE':
      return 'todo tactado';
  }
}

/**
 * Search, batch and phase filters of the work queue. The strip counts each phase over the orders
 * the search and the batch let through, so a tile never reads zero only because it is not selected.
 */
export function useServicesQueue(
  orders: ServiceOrder[],
  batchNameOf: (order: ServiceOrder) => string,
  initialBatchId: number | null,
  serviceType?: 'conventional' | 'insemination'
) {
  const [filters, setFilters] = useState<QueueFilters>({ search: '', batchId: initialBatchId ?? 'ALL', stage: 'ALL' });

  const activeStages = useMemo(() => {
    if (serviceType === 'conventional') {
      return QUEUE_STAGES.filter((s) => s !== 'INSEMINATING');
    }
    return QUEUE_STAGES;
  }, [serviceType]);

  const result = useMemo(() => {
    const base = orders.filter(
      (order) =>
        isQueueOrder(order) &&
        (filters.batchId === 'ALL' || order.batch_id === filters.batchId) &&
        matchesTraySearch(order, batchNameOf(order), filters.search)
    );
    const ofStage = (stage: QueueStage) => base.filter((order) => STAGE_OF[queuePhaseOf(order)] === stage);
    const tiles = Object.fromEntries(
      activeStages.map((stage) => {
        const inStage = ofStage(stage);
        return [stage, { count: inStage.length, caption: stageCaption(stage, inStage) }];
      })
    ) as Record<QueueStage, StageTile>;
    const visible = filters.stage === 'ALL' ? base : ofStage(filters.stage);
    const openFemales = base.reduce((sum, o) => sum + o.female_caravan_ids.length, 0);

    return {
      sections: groupQueueOrders(visible),
      tiles,
      allTile: { count: base.length, caption: `órdenes abiertas · ${openFemales} vientres` } satisfies StageTile,
      visibleCount: visible.length,
      totalCount: orders.filter(isQueueOrder).length,
    };
  }, [orders, batchNameOf, filters, activeStages]);

  return {
    filters,
    ...result,
    setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
    setBatchId: (batchId: QueueFilters['batchId']) => setFilters((f) => ({ ...f, batchId })),
    setStage: (stage: QueueFilters['stage']) => setFilters((f) => ({ ...f, stage })),
    reset: () => setFilters({ search: '', batchId: 'ALL', stage: 'ALL' }),
  };
}

export type ServicesQueueModel = ReturnType<typeof useServicesQueue>;

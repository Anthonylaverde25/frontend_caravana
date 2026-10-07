import { useMemo } from 'react';
import { useEntryOrders } from '@/features/entry-orders/hooks/useEntryOrders';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { StackedSegment } from '../../components/primitives/StackedBar';

export type DteLifecycleStatus = 'IN_TRANSIT' | 'IN_IDENTIFICATION' | 'COMPLETED' | 'INCIDENT';

export interface DteTableItem {
  id: string;
  orderId: number;
  orderCode: string;
  dteNumber: string;
  dteDate: string;
  providerName: string;
  farmName: string;
  declaredHeads: number;
  receivedHeads: number;
  pendingHeads: number;
  uncaravanedHeads: number;
  missingHeads: number;
  excessHeads: number;
  status: DteLifecycleStatus;
  statusLabel: string;
}

export interface DteMetricsResult {
  totalDtes: number;
  totalHeads: number;
  inTransit: {
    dtes: number;
    heads: number;
  };
  inIdentification: {
    dtes: number;
    heads: number;
  };
  completed: {
    dtes: number;
    heads: number;
  };
  withIncidents: {
    dtes: number;
    heads: number;
  };
  segmentsByHeads: StackedSegment[];
  segmentsByDtes: StackedSegment[];
  recentDtes: DteTableItem[];
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
}

/**
 * useDteMetrics
 * Live hook aggregating real DTe operations across entry orders for the active tenant.
 */
export function useDteMetrics(): DteMetricsResult {
  const { data: orders = [], isLoading, isError } = useEntryOrders();

  return useMemo(() => {
    const flattened: DteTableItem[] = [];

    let totalDeclaredHeads = 0;
    let inTransitDtes = 0;
    let inTransitHeads = 0;
    let inIdentDtes = 0;
    let inIdentHeads = 0;
    let completedDtes = 0;
    let completedHeads = 0;
    let incidentDtes = 0;
    let incidentHeads = 0;

    for (const order of orders) {
      if (!order.dtes || order.dtes.length === 0) {
        // If the order has no DTE documents yet, but has pending DTEs or is awaiting
        continue;
      }

      for (const dte of order.dtes) {
        const declared = dte.head_count || 0;
        const received = dte.received_count || 0;
        const pending = dte.pending_count || 0;
        const uncaravaned = dte.uncaravaned_count || 0;
        const missing = dte.missing_head_count || 0;
        const excess = dte.excess_count || 0;

        totalDeclaredHeads += declared;

        let status: DteLifecycleStatus;
        let statusLabel: string;

        if (missing > 0 || excess > 0) {
          status = 'INCIDENT';
          statusLabel = 'Con Novedad';
          incidentDtes += 1;
          incidentHeads += missing + excess;
        } else if (pending > 0) {
          status = 'IN_TRANSIT';
          statusLabel = 'En Tránsito';
          inTransitDtes += 1;
          inTransitHeads += pending;
        } else if (uncaravaned > 0) {
          status = 'IN_IDENTIFICATION';
          statusLabel = 'En Identificación';
          inIdentDtes += 1;
          inIdentHeads += uncaravaned;
        } else {
          status = 'COMPLETED';
          statusLabel = 'Completado';
          completedDtes += 1;
          completedHeads += received;
        }

        flattened.push({
          id: `${order.id}-${dte.id}`,
          orderId: order.id,
          orderCode: order.code,
          dteNumber: dte.dte_number || `DTE-${dte.id}`,
          dteDate: dte.dte_date || order.purchase_date || '—',
          providerName: order.provider?.name || 'Proveedor sin especificar',
          farmName: order.farm?.name || 'Establecimiento general',
          declaredHeads: declared,
          receivedHeads: received,
          pendingHeads: pending,
          uncaravanedHeads: uncaravaned,
          missingHeads: missing,
          excessHeads: excess,
          status,
          statusLabel,
        });
      }
    }

    const totalDtes = flattened.length;

    // Stacked bar segments for Heads
    const segmentsByHeads: StackedSegment[] = [
      { label: 'En Tránsito', value: inTransitHeads, color: DASHBOARD_COLORS.info },
      { label: 'En Identificación', value: inIdentHeads, color: DASHBOARD_COLORS.ochre },
      { label: 'Completados', value: completedHeads, color: DASHBOARD_COLORS.accent },
      { label: 'Con Novedad', value: incidentHeads, color: DASHBOARD_COLORS.danger },
    ];

    // Stacked bar segments for DTE documents count
    const segmentsByDtes: StackedSegment[] = [
      { label: 'En Tránsito', value: inTransitDtes, color: DASHBOARD_COLORS.info },
      { label: 'En Identificación', value: inIdentDtes, color: DASHBOARD_COLORS.ochre },
      { label: 'Completados', value: completedDtes, color: DASHBOARD_COLORS.accent },
      { label: 'Con Novedad', value: incidentDtes, color: DASHBOARD_COLORS.danger },
    ];

    return {
      totalDtes,
      totalHeads: totalDeclaredHeads,
      inTransit: { dtes: inTransitDtes, heads: inTransitHeads },
      inIdentification: { dtes: inIdentDtes, heads: inIdentHeads },
      completed: { dtes: completedDtes, heads: completedHeads },
      withIncidents: { dtes: incidentDtes, heads: incidentHeads },
      segmentsByHeads,
      segmentsByDtes,
      recentDtes: flattened.slice(0, 8),
      isLoading,
      isError,
      hasData: totalDtes > 0,
    };
  }, [orders, isLoading, isError]);
}

export default useDteMetrics;

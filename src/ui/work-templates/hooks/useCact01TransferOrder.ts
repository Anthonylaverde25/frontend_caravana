import { useEffect, useRef } from 'react';
import { useTransferOrderByCode } from '@/features/transfer-orders/hooks/useTransferOrder';
import type { TransferOrder } from '@/features/transfer-orders/types';
import type { Cact01PagesState } from './useCact01Pages';
import type { Cact01DestinationsState } from './useCact01Destinations';

/**
 * The transfer order a scanned CACT-01 sheet names in its header, and what the load inherits
 * from it.
 *
 * A sheet printed from an order descends from it: the source batch, the destination activity
 * and how each destination batch was configured were already declared there. The load takes
 * them instead of asking again, and asks only what the order left for the chute.
 *
 * Only what is still empty or untouched is filled in. What the operator already answered on
 * this screen outranks the order.
 */
export function useCact01TransferOrder(
  pages: Cact01PagesState,
  destinations: Cact01DestinationsState,
  enabled: boolean
) {
  const code = enabled ? pages.metadata.orden_transferencia : '';
  const { data: order = null, isLoading, isFetched } = useTransferOrderByCode(code || null);

  const inheritedHeaderFor = useRef<number | null>(null);

  useEffect(() => {
    if (!order || inheritedHeaderFor.current === order.id) return;

    inheritedHeaderFor.current = order.id;

    // The order outranks a batch proposed from the scanned animals, never one the operator chose.
    if (pages.sourceBatchOrigin !== 'operator') pages.setSourceBatchId(order.source_batch.id, 'order');

    if (pages.metadata.actividad_destino_id == null) {
      pages.setMetadataField('actividad_destino_id', order.destination_activity.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // Destinations appear as the pages load, so this runs whenever a new one shows up.
  useEffect(() => {
    if (!order) return;

    destinations.destinations.forEach((destination) => {
      if (destination.touched) return;

      const declared = order.destinations.find((candidate) => candidate.key === destination.key);

      if (!declared) return;

      const batchId = declared.resolved_batch_id ?? declared.target_batch_id;

      destinations.update(
        destination.key,
        batchId != null
          ? { mode: 'existing', batchId, name: declared.resolved_batch_name ?? declared.target_batch_name ?? declared.label }
          : {
              mode: 'new',
              batchId: null,
              name: declared.new_batch_name ?? declared.label,
              activityId: order.destination_activity.id,
              batchTypeId: declared.new_batch_type_id,
              isConfined: declared.is_confined ?? destination.isConfined
            }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, destinations.destinations]);

  return {
    code,
    order: order as TransferOrder | null,
    isLoading: Boolean(code) && isLoading,
    /** The paper carries a code nobody issued: said out loud, never ignored silently. */
    isNotFound: Boolean(code) && isFetched && !order,
    /**
     * What the submission sends. Null is valid — the order is not mandatory. A closed order is
     * sent too, so the server answers that it no longer admits movements instead of the sheet
     * silently going through without it.
     */
    transferOrderId: order?.id ?? null
  };
}

export type Cact01TransferOrderState = ReturnType<typeof useCact01TransferOrder>;

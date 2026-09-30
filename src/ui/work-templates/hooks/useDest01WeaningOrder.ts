import { useEffect, useRef } from 'react';
import { useWeaningOrderByCode } from '@/features/weaning-orders/hooks/useWeaningOrder';
import { WEANING_TYPE_SHEET_TEXT, WeaningOrder } from '@/features/weaning-orders/types';
import type { Dest01BatchTarget } from '../components/scan/types';
import type { Dest01PagesState } from './useDest01Pages';
import { normalizeDestinationKey } from './useCact01Pages';

export interface Dest01WeaningOrderState {
  /** The code as read off paper, blank on a sheet printed blank. */
  code: string;
  order: WeaningOrder | null;
  isLoading: boolean;
  /** The paper carries a code nobody issued: a misreading, or loose paper. */
  notFound: boolean;
}

const targetFrom = (destination: WeaningOrder['destinations'][number]): Dest01BatchTarget => {
  const batchId = destination.resolved_batch_id ?? destination.target_batch_id;

  return batchId
    ? { mode: 'existing', batchId, name: destination.resolved_batch_name ?? destination.target_batch_name ?? destination.label, isConfined: null, touched: false }
    : { mode: 'new', batchId: null, name: destination.new_batch_name ?? destination.label, isConfined: destination.is_confined, touched: false };
};

/**
 * The weaning order a DEST-01 sheet names, and what the review inherits from it. The sheet is the
 * order's paper: the destination mode, the weaning batches it declared (or created on an earlier
 * round) and its weaning type are not asked again — only what the order left open.
 */
export function useDest01WeaningOrder(state: Dest01PagesState): Dest01WeaningOrderState {
  const code = state.metadata.orden_destete.trim();
  const { data, isLoading } = useWeaningOrderByCode(code || null);
  const order = data ?? null;
  const applied = useRef<string | null>(null);

  // Keyed by the page that started the load: a new load (even of one page again, after "Limpiar")
  // starts from an empty review and has to inherit the order again.
  const loadKey = state.pages[0]?.key ?? '';

  useEffect(() => {
    if (!order || !loadKey || applied.current === `${order.id}:${loadKey}`) return;

    applied.current = `${order.id}:${loadKey}`;
    state.setDestinationMode(order.destination_mode);

    if (order.weaning_type) {
      state.setMetadataField('tipo_destete', WEANING_TYPE_SHEET_TEXT[order.weaning_type]);
    }

    if (order.destination_mode === 'single' && order.destinations[0] && !state.target.touched) {
      state.setTarget(targetFrom(order.destinations[0]));
    }

    if (order.destination_mode === 'per_animal') {
      order.destinations.forEach((destination) => {
        const key = normalizeDestinationKey(destination.label);

        if (!state.perAnimalTargets[key]?.touched) state.setPerAnimalTarget(key, targetFrom(destination));
      });
    }
  }, [order, loadKey]);

  return { code, order, isLoading: Boolean(code) && isLoading, notFound: Boolean(code) && !isLoading && order === null };
}

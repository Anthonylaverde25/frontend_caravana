import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useBirthOrder } from '@/features/birth-orders/hooks/useBirthOrder';
import type { BirthOrder } from '@/features/birth-orders/types';
import { periodOf } from '@/ui/birth-orders/components/birthOrderFormat';
import { usePar01Print } from '../templates/par01/Par01PrintContext';

/**
 * The birth order behind the sheet: `?birthOrderId=` on arrival, or the one chosen in the config
 * drawer. The sheet is born complete with what the order knows — code, lots, period and the pending
 * females soonest due first — and leaves blank only what the round finds out.
 *
 * Keyed by status and by how many are still pending: a round registered elsewhere reprints only
 * who is left, and a draft issued from this very view gets its code without a reload.
 */
export function usePar01OrderPrint() {
  const [searchParams] = useSearchParams();
  const print = usePar01Print();
  const requested = Number(searchParams.get('birthOrderId')) || null;
  const didApplyUrl = useRef(false);

  useEffect(() => {
    if (didApplyUrl.current || !requested) return;

    didApplyUrl.current = true;
    print.setBirthOrderId(requested);
    print.setMode('from_order');
  }, [requested]);

  const { data: order } = useBirthOrder(print.mode === 'from_order' ? print.birthOrderId : null);
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!order) return;

    const key = `${order.id}:${order.status}:${order.pending_head_count}`;

    if (applied.current === key) return;

    applied.current = key;
    apply(order);
  }, [order]);

  const apply = (source: BirthOrder) => {
    // An open order prints who is still to calve; a closed one its roll as it was.
    const lines = source.is_open || source.is_editable ? source.animals.filter((a) => a.status === 'PENDING') : source.animals;

    print.setOrderLockReason(
      source.is_editable
        ? 'Es un borrador: emitilo para imprimirlo.'
        : !source.is_open
          ? `Orden ${source.status_label.toLowerCase()}: la planilla es sólo de consulta.`
          : null
    );
    print.setHeaderField('orden_paricion', source.is_editable ? '' : source.code);
    print.setHeaderField('orden_es_borrador', source.is_editable);
    print.setHeaderField(
      'lote',
      source.source_batches.length === 1 ? (source.source_batches[0].name ?? '') : source.source_batches.length > 1 ? 'Varios' : ''
    );
    print.setHeaderField('periodo', periodOf(source));
    print.setHeaderField('responsable', source.responsable ?? '');
    print.setFemales(
      [...lines]
        .sort(
          (a, b) =>
            (a.estimated_due_date ?? '9999').localeCompare(b.estimated_due_date ?? '9999') ||
            (a.identification ?? '').localeCompare(b.identification ?? '')
        )
        .map((line) => ({
          motherId: line.caravan_id,
          motherIdentification: line.identification ?? ''
        }))
    );
  };

  return order ?? null;
}

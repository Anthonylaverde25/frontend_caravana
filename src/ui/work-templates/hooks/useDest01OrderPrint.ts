import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrder';
import { WEANING_TYPE_SHEET_TEXT, WeaningOrder } from '@/features/weaning-orders/types';
import { useDest01Print } from '../templates/dest01/Dest01PrintContext';

const managementWord = (value: boolean | null): string => (value === true ? 'CORRAL' : value === false ? 'PASTURA' : '');
const managementLetter = (value: boolean | null): 'C' | 'P' | '' => (value === true ? 'C' : value === false ? 'P' : '');

/**
 * The weaning order behind the sheet: `?weaningOrderId=` on arrival, or the one chosen in the config
 * drawer. Everything the order decided is applied, so the sheet is born complete — what is left
 * blank is only what is found out at the chute (weights, notes, and what the order left for it).
 *
 * Keyed by status too: a draft issued from this very view is applied again as the issued order it
 * became, so the code appears and printing unlocks without a reload.
 */
export function useDest01OrderPrint() {
  const [searchParams] = useSearchParams();
  const print = useDest01Print();
  const requested = Number(searchParams.get('weaningOrderId')) || null;
  const didApplyUrl = useRef(false);

  useEffect(() => {
    if (didApplyUrl.current || !requested) return;

    didApplyUrl.current = true;
    print.setWeaningOrderId(requested);
    print.setMode('from_order');
  }, [requested]);

  const { data: order } = useWeaningOrder(print.mode === 'from_order' ? print.weaningOrderId : null);
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!order || applied.current === `${order.id}:${order.status}`) return;

    applied.current = `${order.id}:${order.status}`;
    apply(order);
  }, [order]);

  const apply = (source: WeaningOrder) => {
    const single = source.destination_mode === 'single' ? source.destinations[0] : null;
    const byKey = new Map(source.destinations.map((d) => [d.key, d]));
    // A closed order prints its roll as it was; an open one only what is still to wean.
    const lines = source.is_open ? source.animals.filter((a) => a.status === 'PENDING') : source.animals;

    print.setOrderLockReason(
      source.is_editable
        ? 'Es un borrador: emitilo para imprimirlo.'
        : !source.is_open
          ? `Orden ${source.status_label.toLowerCase()}: la planilla es sólo de consulta.`
          : null
    );
    print.setDestinationMode(source.destination_mode);
    print.setCategoryMode(source.category_mode);
    print.setHeaderField('orden_destete', source.is_editable ? '' : source.code);
    print.setHeaderField('orden_es_borrador', source.is_editable);
    print.setHeaderField('lote_destete', single?.label ?? '');
    print.setHeaderField('sistema_manejo', managementWord(single?.management_is_confined ?? null));
    print.setHeaderField('fecha_destete', source.weaning_date);
    print.setHeaderField('tipo_destete', source.weaning_type ? WEANING_TYPE_SHEET_TEXT[source.weaning_type] : '');
    print.setHeaderField(
      'lote_origen',
      source.source_batches.length === 1 ? (source.source_batches[0].name ?? '') : source.source_batches.length > 1 ? 'Varios (ver crías)' : ''
    );
    print.setHeaderField('responsable', source.responsable ?? '');
    print.setCalves(
      [...lines]
        .sort((a, b) => (a.identification ?? '').localeCompare(b.identification ?? ''))
        .map((line) => {
          const destination = line.destination_key ? byKey.get(line.destination_key) : null;

          return {
            calfId: line.caravan_id,
            calfIdentification: line.identification ?? '',
            motherIdentification: line.mother_identification ?? '',
            calfSex: line.sex,
            currentCategory: line.category_label,
            targetCategory: line.target_category_label,
            destinationLabel: source.destination_mode === 'per_animal' ? (destination?.label ?? null) : null,
            management: source.destination_mode === 'per_animal' ? managementLetter(destination?.management_is_confined ?? null) : ''
          };
        })
    );
  };

  return order ?? null;
}

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useReceiveEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage, type EntryOrder, type EntryOrderDte } from '@/features/entry-orders/types';
import { receivedHeadsOf } from './ReceivedHeadsField';
import { useReceptionRows } from './useReceptionRows';

/** The calendar day where the user is: the reception happened that day there, not in UTC. */
const today = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

interface DteReceptionOptions {
  /** "Recibir y registrar caravanas": the caravans are the point, so they are always loaded. */
  withCaravansAlways?: boolean;
}

/**
 * The reception of one DTE by hand, shared by "Recibir" (the head that arrived, caravans optional)
 * and "Recibir y registrar caravanas" (the same, with the caravans on a full screen): the date, the
 * head confirmed against the DTE — which closes it —, the caravans, the TRI they were read from, and
 * the click that checks and sends it all. On a DTE already received by count it only identifies the
 * head left without caravan.
 */
export function useDteReception(order: EntryOrder, dte: EntryOrderDte | null, onDone: () => void, { withCaravansAlways = false }: DteReceptionOptions = {}) {
  const receive = useReceiveEntryOrder();
  const rows = useReceptionRows();
  const [receivedAt, setReceivedAt] = useState(today());
  const [heads, setHeadsValue] = useState('');
  const [note, setNote] = useState('');
  const [withCaravans, setWithCaravans] = useState(withCaravansAlways);
  const [triNumber, setTriNumber] = useState<string | null>(null);
  const [headsError, setHeadsError] = useState<string | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);

  // A DTE with head in transit is received by count; one already received, only gets its caravans.
  const identifying = dte != null && dte.pending_count === 0 && dte.uncaravaned_count > 0;
  const expected = identifying ? (dte?.uncaravaned_count ?? 0) : (dte?.pending_count ?? 0);
  const received = receivedHeadsOf(heads);
  const loadsCaravans = identifying || withCaravans || withCaravansAlways;
  const caravans = loadsCaravans ? rows.counts.total : 0;
  const isDirty = rows.counts.total > 0 || heads !== '' || note.trim() !== '';

  useEffect(() => {
    if (!dte) return;
    rows.reset();
    setReceivedAt(today());
    setHeadsValue('');
    setNote('');
    setWithCaravans(withCaravansAlways);
    setTriNumber(null);
    setHeadsError(null);
    setHeaderError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dte?.id]);

  const setHeads = (value: string) => {
    setHeadsValue(value);
    setHeadsError(null);
  };

  /** Told on click, not by a disabled button: the theme paints a disabled button like an active one. */
  const checkBeforeSending = (): boolean => {
    const room = (received ?? 0) + (dte?.uncaravaned_count ?? 0);

    setHeaderError(null);
    setHeadsError(null);

    if (rows.counts.untagged > 0) {
      setHeaderError(`Hay ${rows.counts.untagged === 1 ? '1 renglón' : `${rows.counts.untagged} renglones`} con datos y sin caravana: escribí la caravana o borrá lo cargado.`);

      return false;
    }

    if (identifying || withCaravansAlways) {
      if (caravans === 0) {
        setHeaderError(identifying ? 'Cargá la caravana de al menos una de las cabezas recibidas.' : 'Cargá al menos una caravana, o usá "Recibir" para confirmar sólo las cabezas.');

        return false;
      }

      if (identifying) {
        if (caravans <= expected) return true;

        setHeaderError(`Hay ${expected} cabezas sin caravana: cargaste ${caravans} caravanas.`);

        return false;
      }
    }

    if (received == null) setHeadsError('Indicá cuántas cabezas llegaron.');
    else if (caravans > room) setHeadsError(`Hay ${caravans} caravanas para ${received} cabezas: no puede haber más caravanas que cabezas.`);
    else return true;

    return false;
  };

  const submit = () => {
    if (!dte || !checkBeforeSending()) return;

    rows.setRowErrors([]);
    receive.mutate(
      {
        id: order.id,
        payload: {
          method: 'MANUAL',
          received_at: receivedAt,
          dte_id: dte.id,
          animals: caravans > 0 ? rows.animals() : [],
          received_head_count: identifying ? null : received,
          missing_head_count: 0,
          reason: identifying || note.trim() === '' ? null : note.trim(),
          tri_number: caravans > 0 ? triNumber : null
        }
      },
      {
        onSuccess: () => onDone(),
        onError: (error) => {
          const body = entryOrderApiError(error);
          const first = body?.header_errors?.[0];

          rows.setRowErrors(body?.row_errors ?? []);

          if (first?.field === 'received_head_count') setHeadsError(first.message);
          else setHeaderError(first?.message ?? (body?.row_errors?.length ? null : (body?.message ?? null)));

          toast.error(entryOrderErrorMessage(error, 'No se pudo registrar la recepción'));
        }
      }
    );
  };

  return {
    rows,
    receivedAt,
    setReceivedAt,
    minDate: dte?.dte_date,
    maxDate: today(),
    heads,
    setHeads,
    note,
    setNote,
    withCaravans,
    setWithCaravans,
    setTriNumber,
    identifying,
    expected,
    received,
    caravans,
    /** Head the caravans are counted against, and what they are. */
    caravansExpected: identifying ? expected : (received ?? expected) + (dte?.uncaravaned_count ?? 0),
    caravansExpectedLabel: identifying ? 'sin caravana' : received == null ? 'en tránsito' : 'recibidas',
    headsError,
    headerError,
    isDirty,
    isPending: receive.isPending,
    submit
  };
}

export type DteReception = ReturnType<typeof useDteReception>;

import { useMemo, useState } from 'react';
import type { DteRowError, EntryOrderDte, ReceivePayload } from '@/features/entry-orders/types';

/** What happens to a pending caravan left unticked: it comes another day, or it never will. */
export type UntickedFate = 'LATER' | 'MISSING';

export interface ReceptionLine {
  caravanId: number;
  identification: string;
  dteNumber: string;
  checked: boolean;
  weight: string;
  fate: UntickedFate;
}

const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * The manual reception of one DTE, or of all of them at once ("Recibir todo"): every caravan still
 * in transit comes ticked. An unticked one
 * arrives later by default; only when it is marked "No va a llegar" does the reason become
 * mandatory, because that is final.
 */
export function useReceptionDraft() {
  const [receivedAt, setReceivedAt] = useState(today());
  const [lines, setLines] = useState<ReceptionLine[]>([]);
  const [reason, setReason] = useState('');
  const [rowErrors, setRowErrors] = useState<DteRowError[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);

  const reset = (dtes: EntryOrderDte[]) => {
    setReceivedAt(today());
    setReason('');
    setRowErrors([]);
    setHeaderError(null);
    setLines(
      dtes.flatMap((dte) =>
        (dte.animals ?? [])
          .filter((animal) => animal.reception_status === 'PENDING')
          .map((animal) => ({
            caravanId: animal.caravan_id,
            identification: animal.identification,
            dteNumber: dte.dte_number,
            checked: true,
            weight: '',
            fate: 'LATER' as UntickedFate
          }))
      )
    );
  };

  const update = (caravanId: number, patch: Partial<ReceptionLine>) => {
    setLines((current) => current.map((line) => (line.caravanId === caravanId ? { ...line, ...patch } : line)));
    setRowErrors([]);
  };

  const setAll = (checked: boolean) => setLines((current) => current.map((line) => ({ ...line, checked })));

  const counts = useMemo(
    () => ({
      received: lines.filter((line) => line.checked).length,
      later: lines.filter((line) => !line.checked && line.fate === 'LATER').length,
      missing: lines.filter((line) => !line.checked && line.fate === 'MISSING').length
    }),
    [lines]
  );

  /** Without a DTE the server takes caravans of any DTE of the order. */
  const payload = (dteId: number | null): ReceivePayload => ({
    method: 'MANUAL',
    received_at: receivedAt,
    dte_id: dteId,
    received: lines
      .filter((line) => line.checked)
      .map((line) => ({ caravan_id: line.caravanId, weight: line.weight === '' ? null : Number(line.weight) })),
    missing: lines.filter((line) => !line.checked && line.fate === 'MISSING').map((line) => line.caravanId),
    reason: reason.trim() || null
  });

  /** The server reports rows of `received` and of `missing` by their index in each list. */
  const errorOf = (caravanId: number): string | undefined => {
    const receivedIndex = lines.filter((line) => line.checked).findIndex((line) => line.caravanId === caravanId);
    const missingIndex = lines.filter((line) => !line.checked && line.fate === 'MISSING').findIndex((line) => line.caravanId === caravanId);

    return rowErrors.find(
      (e) => (e.field !== 'missing' && e.row === receivedIndex && receivedIndex >= 0) || (e.field === 'missing' && e.row === missingIndex && missingIndex >= 0)
    )?.message;
  };

  return {
    receivedAt,
    setReceivedAt,
    lines,
    update,
    setAll,
    reason,
    setReason,
    counts,
    payload,
    reset,
    errorOf,
    setRowErrors,
    headerError,
    setHeaderError
  };
}

export type ReceptionDraft = ReturnType<typeof useReceptionDraft>;

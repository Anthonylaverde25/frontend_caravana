import { useState } from 'react';
import type { DteHeaderError, LoadDtePayload } from '@/features/entry-orders/types';

const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * The DTE being loaded: its number, date and the head it declares. The caravans are not part of
 * it — they are written down when the animals arrive. "Registrar ingreso" also asks the day the
 * animals entered. The paper is recommended, not required: `withoutDte` validates and sends only
 * the head that move.
 */
export function useDteDraft() {
  const [dteNumber, setDteNumber] = useState('');
  const [dteDate, setDteDate] = useState(today());
  const [enteredAt, setEnteredAt] = useState(today());
  const [headCount, setHeadCount] = useState('');
  const [observations, setObservations] = useState('');
  const [headerErrors, setHeaderErrors] = useState<DteHeaderError[]>([]);

  const clearError = (field: string) => setHeaderErrors((current) => current.filter((error) => error.field !== field));

  const reset = (head: number | null = null) => {
    setDteNumber('');
    setDteDate(today());
    setEnteredAt(today());
    setHeadCount(head != null && head > 0 ? String(head) : '');
    setObservations('');
    setHeaderErrors([]);
  };

  const heads = Math.trunc(Number(headCount) || 0);

  /**
   * What can be told before asking the server. Marks the fields and returns whether it can be sent.
   * `fallbackHead` stands for a head count left blank ("Registrar ingreso": the animals loaded).
   */
  const validate = (fallbackHead = 0, withoutDte = false): boolean => {
    const errors: DteHeaderError[] = [];

    if (!withoutDte && dteNumber.trim() === '') errors.push({ field: 'dte_number', code: 'DTE_NUMBER_MISSING', message: 'Falta el número de DTE.' });
    if ((headCount === '' ? fallbackHead : heads) < 1) errors.push({ field: 'head_count', code: 'HEAD_COUNT_INVALID', message: 'Indicá cuántas cabezas vienen.' });

    setHeaderErrors(errors);

    return errors.length === 0;
  };

  const payload = (withoutDte = false): LoadDtePayload => ({
    ...(withoutDte ? { without_dte: true } : { dte_number: dteNumber.trim(), dte_date: dteDate }),
    head_count: heads,
    observations: observations.trim() || null
  });

  return {
    dteNumber,
    setDteNumber: (value: string) => {
      setDteNumber(value);
      clearError('dte_number');
    },
    dteDate,
    setDteDate,
    enteredAt,
    setEnteredAt,
    headCount,
    heads,
    setHeadCount: (value: string) => {
      setHeadCount(value);
      clearError('head_count');
    },
    observations,
    setObservations,
    payload,
    validate,
    reset,
    headerErrors,
    setHeaderErrors,
    isDirty: dteNumber.trim() !== '' || headCount !== '' || observations.trim() !== ''
  };
}

export type DteDraft = ReturnType<typeof useDteDraft>;

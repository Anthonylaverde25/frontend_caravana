import { useCallback, useMemo, useState } from 'react';
import type { DteHeaderError, DteRowError, EntryOrderWarning, LoadDtePayload } from '@/features/entry-orders/types';

export interface DteRow {
  key: number;
  caravana: string;
  sex: 'M' | 'H' | '';
  breed_position: number | '';
  weight: string;
}

/** What the grid needs to know about the order the DTE is loaded into. */
export interface DteTroopContext {
  /** Only a troop of both sexes asks the sex of each caravan. */
  isMixed: boolean;
  maleCount: number | null;
  femaleCount: number | null;
  enteredMale: number;
  enteredFemale: number;
  /** Head still expected by the order. */
  pending: number;
  headCount: number;
  /** Only several breeds ask the breed of each caravan. */
  breeds: { position: number; letter: string; label: string }[];
  minWeight: number | null;
  maxWeight: number | null;
}

const today = (): string => new Date().toISOString().slice(0, 10);

let nextKey = 1;

const emptyRow = (caravana = ''): DteRow => ({ key: nextKey++, caravana, sex: '', breed_position: '', weight: '' });

/**
 * The DTE being loaded: its header and one row per caravan. Caravans usually arrive as a list
 * copied from the document, so they can be pasted (one per line, or separated by commas or
 * spaces); sex and breed can then be assigned in bulk.
 */
export function useDteDraft() {
  const [dteNumber, setDteNumber] = useState('');
  const [dteDate, setDteDate] = useState(today());
  const [enteredAt, setEnteredAt] = useState(today());
  const [observations, setObservations] = useState('');
  const [rows, setRows] = useState<DteRow[]>([]);
  const [headerErrors, setHeaderErrors] = useState<DteHeaderError[]>([]);
  const [rowErrors, setRowErrors] = useState<DteRowError[]>([]);
  const [warnings, setWarnings] = useState<EntryOrderWarning[]>([]);

  const clearServerFeedback = () => {
    setHeaderErrors([]);
    setRowErrors([]);
  };

  const paste = useCallback((text: string): number => {
    const tags = text
      .split(/[\s,;]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    setRows((current) => {
      const known = new Set(current.map((row) => row.caravana.toUpperCase()));
      const fresh = tags.filter((tag) => !known.has(tag.toUpperCase()) && known.add(tag.toUpperCase()));

      return [...current.filter((row) => row.caravana !== ''), ...fresh.map((tag) => emptyRow(tag))];
    });
    clearServerFeedback();

    return tags.length;
  }, []);

  const addRow = () => setRows((current) => [...current, emptyRow()]);

  /** Editing a row clears the errors the server reported on it: they describe what it said before. */
  const updateRow = (key: number, patch: Partial<DteRow>) => {
    const index = rows.findIndex((row) => row.key === key);

    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    setRowErrors((current) => current.filter((error) => error.row !== index));
  };

  const removeRow = (key: number) => {
    setRows((current) => current.filter((row) => row.key !== key));
    clearServerFeedback();
  };

  /** "Todos M", "Todos raza A": only over the rows still blank, so nothing declared is overwritten. */
  const assignBlank = (field: 'sex' | 'breed_position', value: DteRow['sex'] | DteRow['breed_position']) => {
    setRows((current) => current.map((row) => (row[field] === '' ? { ...row, [field]: value } : row)));
    // What the server said about those cells described them blank.
    setRowErrors((current) => current.filter((error) => error.field !== field));
  };

  const reset = () => {
    setDteNumber('');
    setDteDate(today());
    setEnteredAt(today());
    setObservations('');
    setRows([]);
    clearServerFeedback();
    setWarnings([]);
  };

  const counts = useMemo(
    () => ({
      total: rows.length,
      male: rows.filter((row) => row.sex === 'M').length,
      female: rows.filter((row) => row.sex === 'H').length
    }),
    [rows]
  );

  const payload = (): LoadDtePayload => ({
    dte_number: dteNumber.trim(),
    dte_date: dteDate,
    entered_at: enteredAt,
    observations: observations.trim() || null,
    animals: rows.map((row) => ({
      caravana: row.caravana.trim(),
      sex: row.sex || null,
      breed_position: row.breed_position === '' ? null : Number(row.breed_position),
      weight: row.weight === '' ? null : Number(row.weight)
    }))
  });

  return {
    dteNumber,
    setDteNumber,
    dteDate,
    setDteDate,
    enteredAt,
    setEnteredAt,
    observations,
    setObservations,
    rows,
    paste,
    addRow,
    updateRow,
    removeRow,
    assignBlank,
    counts,
    payload,
    reset,
    headerErrors,
    setHeaderErrors,
    rowErrors,
    setRowErrors,
    warnings,
    setWarnings
  };
}

export type DteDraft = ReturnType<typeof useDteDraft>;

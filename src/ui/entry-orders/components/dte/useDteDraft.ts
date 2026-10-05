import { useMemo, useState } from 'react';
import type { DteHeaderError, DteRowError, EntryOrderWarning, LoadDtePayload, RegisterEntryPayload } from '@/features/entry-orders/types';

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
  /** Caravans of each sex already listed in a DTE of the order. */
  withDteMale: number;
  withDteFemale: number;
  /** Head bought still waiting for their document. */
  pending: number;
  headCount: number;
  /** Only several breeds ask the breed of each caravan. */
  breeds: { position: number; letter: string; label: string }[];
  minWeight: number | null;
  maxWeight: number | null;
  /**
   * "Registrar ingreso": the animals arrive with the DTE, so it asks the entry day and the weight
   * of each caravan. "Cargar DTE" asks neither: the animals are received later.
   */
  withArrival: boolean;
}

const today = (): string => new Date().toISOString().slice(0, 10);

let nextKey = 1;

const emptyRow = (caravana = ''): DteRow => ({ key: nextKey++, caravana, sex: '', breed_position: '', weight: '' });

const isBlank = (row: DteRow) => row.caravana.trim() === '' && row.sex === '' && row.breed_position === '' && row.weight === '';

/** The grid always ends with one blank row: typing in it is how a caravan is added. */
const withTrailingBlank = (rows: DteRow[]): DteRow[] => (rows.length > 0 && isBlank(rows[rows.length - 1]) ? rows : [...rows, emptyRow()]);

const SEX_WORDS: Record<string, 'M' | 'H'> = { M: 'M', MACHO: 'M', H: 'H', HEMBRA: 'H' };

/**
 * The caravans of a pasted list. A line may carry the sex after the tag ("0331 H", "0331 macho"),
 * as the DTE lists it; otherwise every token is a tag.
 */
const parseTags = (text: string): { caravana: string; sex: DteRow['sex'] }[] =>
  text.split(/\r?\n/).flatMap((line): { caravana: string; sex: DteRow['sex'] }[] => {
    const tokens = line
      .split(/[\s,;\t]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    const sex = tokens.length === 2 ? SEX_WORDS[tokens[1].toUpperCase()] : undefined;

    return sex ? [{ caravana: tokens[0], sex }] : tokens.map((caravana) => ({ caravana, sex: '' }));
  });

/**
 * The DTE being loaded: its header and one row per caravan, entered like a spreadsheet — cell by
 * cell, or by pasting the list copied from the document into any cell, which spreads it over as
 * many rows. Sex and breed can then be assigned in bulk. Blank rows are ignored.
 */
export function useDteDraft() {
  const [dteNumber, setDteNumber] = useState('');
  const [dteDate, setDteDate] = useState(today());
  const [enteredAt, setEnteredAt] = useState(today());
  const [observations, setObservations] = useState('');
  const [rows, setRows] = useState<DteRow[]>(() => [emptyRow()]);
  const [headerErrors, setHeaderErrors] = useState<DteHeaderError[]>([]);
  const [rowErrors, setRowErrors] = useState<DteRowError[]>([]);
  const [warnings, setWarnings] = useState<EntryOrderWarning[]>([]);

  /** The rows that will be sent; the server reports row errors by their index in this list. */
  const filled = useMemo(() => rows.filter((row) => row.caravana.trim() !== ''), [rows]);

  /** Index of a row among the filled ones, or -1 when it is blank. */
  const sentIndexOf = (key: number): number => filled.findIndex((row) => row.key === key);

  /**
   * Editing a row clears what the server said about it. Several tags in the caravan cell (a
   * pasted list) become one row each, right after it, with their sex when the list carries it.
   */
  const updateRow = (key: number, patch: Partial<DteRow>) => {
    const sentIndex = sentIndexOf(key);

    setRows((current) => {
      const index = current.findIndex((row) => row.key === key);
      if (index < 0) return current;

      const tags = patch.caravana !== undefined ? parseTags(patch.caravana) : [];
      const next = [...current];

      if (tags.length > 1 || tags[0]?.sex) {
        const known = new Set(current.filter((row) => row.key !== key).map((row) => row.caravana.trim().toUpperCase()));
        const fresh = tags.filter((tag) => !known.has(tag.caravana.toUpperCase()) && known.add(tag.caravana.toUpperCase()));
        const [first, ...rest] = fresh;
        next.splice(
          index,
          1,
          { ...current[index], ...patch, caravana: first?.caravana ?? '', sex: first?.sex || current[index].sex },
          ...rest.map((tag) => ({ ...emptyRow(tag.caravana), sex: tag.sex }))
        );
      } else {
        next[index] = { ...current[index], ...patch };
      }

      return withTrailingBlank(next);
    });
    setRowErrors((current) => current.filter((error) => error.row !== sentIndex));
    setHeaderErrors((current) => current.filter((error) => error.field !== 'animals'));
  };

  const removeRow = (key: number) => {
    setRows((current) => withTrailingBlank(current.filter((row) => row.key !== key)));
    setRowErrors([]);
  };

  /** "Sin sexo → Macho": only over the caravans still blank, so nothing declared is overwritten. */
  const assignBlank = (field: 'sex' | 'breed_position', value: DteRow['sex'] | DteRow['breed_position']) => {
    setRows((current) => current.map((row) => (row.caravana.trim() !== '' && row[field] === '' ? { ...row, [field]: value } : row)));
    // What the server said about those cells described them blank.
    setRowErrors((current) => current.filter((error) => error.field !== field));
  };

  const reset = () => {
    setDteNumber('');
    setDteDate(today());
    setEnteredAt(today());
    setObservations('');
    setRows([emptyRow()]);
    setHeaderErrors([]);
    setRowErrors([]);
    setWarnings([]);
  };

  /**
   * What can be told before asking the server: the document number and at least one caravan.
   * Marks the fields and returns whether it can be sent.
   */
  const validate = (): boolean => {
    const errors: DteHeaderError[] = [];

    if (dteNumber.trim() === '') errors.push({ field: 'dte_number', code: 'DTE_NUMBER_MISSING', message: 'Falta el número de DTE.' });
    if (filled.length === 0) errors.push({ field: 'animals', code: 'DTE_EMPTY', message: 'Cargá al menos una caravana del DTE.' });

    setHeaderErrors(errors);
    setRowErrors([]);

    return errors.length === 0;
  };

  const counts = useMemo(
    () => ({
      total: filled.length,
      male: filled.filter((row) => row.sex === 'M').length,
      female: filled.filter((row) => row.sex === 'H').length,
      blankSex: filled.filter((row) => row.sex === '').length,
      blankBreed: filled.filter((row) => row.breed_position === '').length
    }),
    [filled]
  );

  const payload = (): LoadDtePayload => ({
    dte_number: dteNumber.trim(),
    dte_date: dteDate,
    observations: observations.trim() || null,
    animals: filled.map((row) => ({
      caravana: row.caravana.trim(),
      sex: row.sex || null,
      breed_position: row.breed_position === '' ? null : Number(row.breed_position)
    }))
  });

  /** The DTE of "Registrar ingreso", with the entry day and the weights taken on arrival. */
  const registerPayload = (): RegisterEntryPayload['dte'] => {
    const base = payload();

    return {
      ...base,
      entered_at: enteredAt,
      animals: base.animals.map((animal, i) => ({ ...animal, weight: filled[i].weight === '' ? null : Number(filled[i].weight) }))
    };
  };

  return {
    dteNumber,
    setDteNumber: (value: string) => {
      setDteNumber(value);
      setHeaderErrors((current) => current.filter((error) => error.field !== 'dte_number'));
    },
    dteDate,
    setDteDate,
    enteredAt,
    setEnteredAt,
    observations,
    setObservations,
    rows,
    sentIndexOf,
    updateRow,
    removeRow,
    assignBlank,
    counts,
    payload,
    registerPayload,
    validate,
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

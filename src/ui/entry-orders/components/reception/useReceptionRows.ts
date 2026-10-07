import { useMemo, useState } from 'react';
import type { ArrivalFindingCode, DteRowError, EntryOrder, EntryOrderWarning, ReceivedAnimalPayload } from '@/features/entry-orders/types';
import { CategoryLine, inheritedSexOf, needsCategoryPerAnimal } from '@/features/entry-orders/categoryLines';

export interface ReceptionRow {
  key: number;
  caravana: string;
  sex: 'M' | 'H' | '';
  breed_position: number | '';
  category_position: number | '';
  /** The breed chosen while its coat is still to choose (an order with that breed in several coats). */
  breed_name: string;
  weight: string;
  body_condition: string;
  /** What the animal came off the truck with. */
  arrival_findings: ArrivalFindingCode[];
}

/** What the grid needs to know about the order the animals are received on. */
export interface ReceptionTroopContext {
  /** Only a troop of both sexes asks the sex of each caravan. */
  isMixed: boolean;
  /** Only several breeds ask the breed of each caravan. A line is a breed and its coat. */
  breeds: { position: number; letter: string; label: string; breedName: string; colorName: string | null }[];
  /** The order's categories; a caravan declares its line only when its sex admits several. */
  categories: CategoryLine[];
  /** Some animal's sex admits several categories: the grid shows the CAT column. */
  needsCategory: boolean;
  /** The sex every caravan has when the troop is of one sex. */
  inheritedSex: 'M' | 'H' | null;
  minWeight: number | null;
  maxWeight: number | null;
}

/** What the grid needs from an order already saved. */
export const troopContextOf = (
  order: Pick<EntryOrder, 'sex_composition' | 'breeds' | 'categories' | 'min_weight' | 'max_weight'>
): ReceptionTroopContext => {
  const categories = order.categories.map((c) => ({ position: c.position, name: c.name, sex: c.sex }));

  return {
    isMixed: order.sex_composition === 'MIXED',
    breeds: order.breeds.map((b) => ({ position: b.position, letter: b.letter, label: b.label, breedName: b.breed_name ?? b.label, colorName: b.color_name })),
    categories,
    needsCategory: needsCategoryPerAnimal(categories, order.sex_composition),
    inheritedSex: inheritedSexOf(order.sex_composition),
    minWeight: order.min_weight,
    maxWeight: order.max_weight
  };
};

let nextKey = 1;

const emptyRow = (caravana = ''): ReceptionRow => ({
  key: nextKey++,
  caravana,
  sex: '',
  breed_position: '',
  category_position: '',
  breed_name: '',
  weight: '',
  body_condition: '',
  arrival_findings: []
});

const isBlank = (row: ReceptionRow) =>
  row.caravana.trim() === '' &&
  row.sex === '' &&
  row.breed_position === '' &&
  row.category_position === '' &&
  row.breed_name === '' &&
  row.weight === '' &&
  row.body_condition === '' &&
  row.arrival_findings.length === 0;

/** The grid always ends with one blank row: typing in it is how a caravan is added. */
const withTrailingBlank = (rows: ReceptionRow[]): ReceptionRow[] =>
  rows.length > 0 && isBlank(rows[rows.length - 1]) ? rows : [...rows, emptyRow()];

const SEX_WORDS: Record<string, 'M' | 'H'> = { M: 'M', MACHO: 'M', H: 'H', HEMBRA: 'H' };

/**
 * The caravans of a pasted list. A line may carry the sex after the tag ("0331 H", "0331 macho");
 * otherwise every token is a tag.
 */
const parseTags = (text: string): { caravana: string; sex: ReceptionRow['sex'] }[] =>
  text.split(/\r?\n/).flatMap((line): { caravana: string; sex: ReceptionRow['sex'] }[] => {
    const tokens = line
      .split(/[\s,;\t]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    const sex = tokens.length === 2 ? SEX_WORDS[tokens[1].toUpperCase()] : undefined;

    return sex ? [{ caravana: tokens[0], sex }] : tokens.map((caravana) => ({ caravana, sex: '' }));
  });

const numberOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value.replace(',', '.')));

/**
 * The animals that arrived, one row per caravan written down, entered like a spreadsheet — cell by
 * cell, or by pasting a list into any cell, which spreads it over as many rows. Sex, breed and
 * category can then be assigned in bulk, and each row marks what the animal came off the truck
 * with. Blank rows are ignored.
 */
export function useReceptionRows() {
  const [rows, setRows] = useState<ReceptionRow[]>(() => [emptyRow()]);
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
  const updateRow = (key: number, patch: Partial<ReceptionRow>) => {
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
        next[index] = { ...current[index], ...patch, caravana: first?.caravana ?? '', sex: first?.sex || current[index].sex };
        // The rest fill the blank rows below first (a grid laid out with a row per head), then new ones.
        let at = index + 1;
        rest.forEach((tag) => {
          while (at < next.length && !isBlank(next[at])) at += 1;
          const row = { ...emptyRow(tag.caravana), sex: tag.sex };

          if (at < next.length) next[at] = { ...row, key: next[at].key };
          else next.push(row);
          at += 1;
        });
      } else {
        next[index] = { ...current[index], ...patch };
      }

      return withTrailingBlank(next);
    });
    setRowErrors((current) => current.filter((error) => error.row !== sentIndex));
  };

  const removeRow = (key: number) => {
    setRows((current) => withTrailingBlank(current.filter((row) => row.key !== key)));
    setRowErrors([]);
  };

  /**
   * "Sin sexo → Macho": only over the caravans still blank, so nothing declared is overwritten.
   * `applies` narrows it further (a category only goes to the caravans whose sex it admits).
   */
  const assignBlank = (
    field: 'sex' | 'breed_position' | 'category_position',
    value: ReceptionRow['sex'] | ReceptionRow['breed_position'],
    applies: (row: ReceptionRow) => boolean = () => true
  ) => {
    setRows((current) =>
      current.map((row) => (row.caravana.trim() !== '' && row[field] === '' && applies(row) ? { ...row, [field]: value } : row))
    );
    setRowErrors((current) => current.filter((error) => error.field !== field));
  };

  /**
   * Caravans read from a document (the TRI) written into the blank rows, in order, and as new rows
   * when there are no more. A tag already in the grid is not repeated. Returns how many were added.
   */
  const appendTags = (tags: string[]): number => {
    const known = new Set(filled.map((row) => row.caravana.trim().toUpperCase()));
    const fresh = tags.filter((tag) => tag.trim() !== '' && !known.has(tag.trim().toUpperCase()) && known.add(tag.trim().toUpperCase()));

    setRows((current) => {
      const queue = fresh.map((tag) => tag.trim().toUpperCase());
      const next = current.map((row) => (queue.length > 0 && isBlank(row) ? { ...row, caravana: queue.shift() as string } : row));

      return withTrailingBlank([...next, ...queue.map((tag) => emptyRow(tag))]);
    });

    return fresh.length;
  };

  /**
   * At least `count` rows to write in, laid out from the start like the sheet's blank lines, plus
   * the trailing blank one. What was written is kept.
   */
  const ensureRows = (count: number) =>
    setRows((current) => {
      const missing = count + 1 - current.length;

      return missing > 0 ? [...current, ...Array.from({ length: missing }, () => emptyRow())] : current;
    });

  const reset = () => {
    setRows([emptyRow()]);
    setRowErrors([]);
    setWarnings([]);
  };

  const counts = useMemo(
    () => ({
      total: filled.length,
      male: filled.filter((row) => row.sex === 'M').length,
      female: filled.filter((row) => row.sex === 'H').length,
      blankSex: filled.filter((row) => row.sex === '').length,
      blankBreed: filled.filter((row) => row.breed_position === '').length,
      blankCategory: filled.filter((row) => row.category_position === '').length,
      injured: filled.filter((row) => row.arrival_findings.length > 0).length,
      /** Rows with something written but no caravan: they are not sent. */
      untagged: rows.filter((row) => row.caravana.trim() === '' && !isBlank(row)).length
    }),
    [filled, rows]
  );

  const animals = (): ReceivedAnimalPayload[] =>
    filled.map((row) => ({
      caravana: row.caravana.trim(),
      sex: row.sex || null,
      breed_position: row.breed_position === '' ? null : Number(row.breed_position),
      category_position: row.category_position === '' ? null : Number(row.category_position),
      weight: numberOrNull(row.weight),
      body_condition: numberOrNull(row.body_condition),
      arrival_findings: row.arrival_findings
    }));

  return {
    rows,
    sentIndexOf,
    updateRow,
    removeRow,
    assignBlank,
    appendTags,
    ensureRows,
    counts,
    animals,
    reset,
    rowErrors,
    setRowErrors,
    warnings,
    setWarnings
  };
}

export type ReceptionRows = ReturnType<typeof useReceptionRows>;

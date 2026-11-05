import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';
import {
  BatchWeighingEntry,
  CageGroupInput,
  RegisterBatchWeighingPayload,
  ShrunkCondition,
  WeighingType,
  WeighingTypeCode,
} from '@/core/weighing/domain/entities/Weighing';
import { summarizeCageGroups } from '@/core/weighing/domain/services/cageGroups';
import { localToday } from '@/ui/exit-orders/components/exitOrderFormat';

export interface CageGroupRow {
  key: number;
  /** Which category went on this cage. Empty until chosen, in a batch of several. */
  categoryKey: string;
  headCount: string;
  gross: string;
  tare: string;
}

export interface BatchWeighingFormState {
  type: WeighingTypeCode;
  date: string;
  time: string;
  shrunkCondition: ShrunkCondition;
  shrinkPct: string;
  responsable: string;
  observations: string;
  /** BY_CATEGORY entry: kg per head by category. An empty one keeps the weights of its animals. */
  averages: Record<string, string>;
  /**
   * Off for the usual case: the scale is zeroed before each load and shows the net kilos. On for
   * a truck weighed full and empty, or a scale that was not zeroed.
   */
  withTare: boolean;
  groups: CageGroupRow[];
}

export interface BatchWeighingFormErrors {
  date?: string;
  shrinkPct?: string;
  averages?: string;
  averageRows?: Record<string, string>;
  groups?: string;
  rows?: Record<number, string>;
}

let nextKey = 1;

export const emptyGroup = (categoryKey = ''): CageGroupRow => ({ key: nextKey++, categoryKey, headCount: '', gross: '', tare: '0' });

/** The operator's day: the UTC one is already tomorrow from 21:00 in Argentina. */
const today = localToday;

export const categoryKey = (category: Pick<BatchCategoryCount, 'category_id'>) => String(category.category_id ?? 'none');

export function initialBatchWeighingState(type?: WeighingType): BatchWeighingFormState {
  return {
    type: type?.code ?? 'BATCH_AVERAGE',
    date: today(),
    time: '',
    shrunkCondition: type?.default_shrunk_condition ?? 'FULL_WEIGHT',
    shrinkPct: '',
    responsable: '',
    observations: '',
    averages: {},
    withTare: false,
    groups: [emptyGroup()],
  };
}

/** A batch of one category leaves nothing to choose: every cage is of that category. */
export const rowCategoryKey = (row: CageGroupRow, categories: BatchCategoryCount[]) =>
  categories.length === 1 ? categoryKey(categories[0]) : row.categoryKey;

export const toGroupInput = (row: CageGroupRow, categories: BatchCategoryCount[]): CageGroupInput => ({
  category_id: categories.find((c) => categoryKey(c) === rowCategoryKey(row, categories))?.category_id ?? null,
  head_count: Number(row.headCount) || 0,
  gross_weight: Number(row.gross) || 0,
  tare_weight: Number(row.tare) || 0,
});

/** The cages of each category of the batch, added up: what each one will receive. */
export const loadsByCategory = (form: BatchWeighingFormState, categories: BatchCategoryCount[]) =>
  categories.map((category) => ({
    category,
    summary: summarizeCageGroups(
      form.groups.filter((row) => rowCategoryKey(row, categories) === categoryKey(category)).map((row) => toGroupInput(row, categories)),
      category.count
    ),
  }));

/** The categories the operator gave an average to. */
export const filledCategories = (form: BatchWeighingFormState, categories: BatchCategoryCount[]) =>
  categories.filter((c) => (form.averages[categoryKey(c)] ?? '').trim() !== '');

function validateAverages(form: BatchWeighingFormState, categories: BatchCategoryCount[], errors: BatchWeighingFormErrors) {
  const filled = filledCategories(form, categories);
  const rows: Record<string, string> = {};

  if (filled.length === 0) {
    errors.averages = 'Cargá el promedio de al menos una categoría.';
  }

  filled.forEach((category) => {
    const key = categoryKey(category);
    const average = Number(form.averages[key]);
    if (!(average > 0)) {
      rows[key] = 'El promedio tiene que ser mayor a 0 kg.';
    } else if (average > 1200) {
      rows[key] = 'Más de 1.200 kg/cab no es posible.';
    }
  });

  if (Object.keys(rows).length > 0) {
    errors.averageRows = rows;
  }
}

function validateLoads(form: BatchWeighingFormState, categories: BatchCategoryCount[], errors: BatchWeighingFormErrors) {
  const rows: Record<number, string> = {};

  form.groups.forEach((row, index) => {
    const g = toGroupInput(row, categories);
    if (rowCategoryKey(row, categories) === '') {
      rows[row.key] = `Jaula ${index + 1}: indicá la categoría.`;
    } else if (!Number.isInteger(g.head_count) || g.head_count < 1) {
      rows[row.key] = `Jaula ${index + 1}: indicá las cabezas.`;
    } else if (g.gross_weight <= 0) {
      rows[row.key] = `Jaula ${index + 1}: indicá ${form.withTare ? 'el bruto' : 'los kg'}.`;
    } else if (form.withTare && g.gross_weight <= g.tare_weight) {
      rows[row.key] = `Jaula ${index + 1}: el bruto tiene que superar la tara.`;
    }
  });

  if (form.groups.length === 0) {
    errors.groups = 'Cargá al menos una jaula.';
  }

  if (Object.keys(rows).length > 0) {
    errors.rows = rows;
  }
}

/** Validated on click: the button stays enabled and each faulty row is marked. */
export function validateBatchWeighing(
  form: BatchWeighingFormState,
  entry: BatchWeighingEntry,
  categories: BatchCategoryCount[]
): BatchWeighingFormErrors {
  const errors: BatchWeighingFormErrors = {};

  if (!form.date) {
    errors.date = 'Indicá la fecha del pesaje.';
  } else if (form.date > today()) {
    errors.date = 'La fecha no puede ser futura.';
  }

  if (form.shrunkCondition === 'CALCULATED') {
    const pct = Number(form.shrinkPct);
    if (form.shrinkPct.trim() === '' || !(pct > 0 && pct < 30)) {
      errors.shrinkPct = 'Indicá el % de desbaste (entre 0 y 30).';
    }
  }

  if (entry === 'BY_CATEGORY') {
    validateAverages(form, categories, errors);
  } else {
    validateLoads(form, categories, errors);
  }

  return errors;
}

export const hasErrors = (errors: BatchWeighingFormErrors) => Object.keys(errors).length > 0;

export function toBatchWeighingPayload(
  batchId: number,
  form: BatchWeighingFormState,
  entry: BatchWeighingEntry,
  categories: BatchCategoryCount[]
): RegisterBatchWeighingPayload {
  return {
    batch_id: batchId,
    weighing_type: form.type,
    weighing_date: form.date,
    weighing_time: form.time || null,
    shrunk_condition: form.shrunkCondition,
    shrink_pct: form.shrunkCondition === 'CALCULATED' ? Number(form.shrinkPct) : null,
    responsable: form.responsable.trim() || null,
    observations: form.observations.trim() || null,
    entry,
    ...(entry === 'BY_CATEGORY'
      ? {
          averages: filledCategories(form, categories).map((c) => ({
            category_id: c.category_id,
            head_count: c.count,
            average_weight: Number(form.averages[categoryKey(c)]),
          })),
        }
      : { groups: form.groups.map((row) => toGroupInput(row, categories)) }),
  };
}

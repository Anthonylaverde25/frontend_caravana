import {
  BatchWeighingEntry,
  CageGroupInput,
  RegisterBatchWeighingPayload,
  ShrunkCondition,
  WeighingType,
  WeighingTypeCode,
} from '@/core/weighing/domain/entities/Weighing';

export interface CageGroupRow {
  key: number;
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
  observations: string;
  entry: BatchWeighingEntry;
  /** AVERAGE entry: kg per head and the heads it covers. */
  averageWeight: string;
  headCount: string;
  /**
   * Off for the usual case: the scale is zeroed before each load and shows the net kilos. On for
   * a truck weighed full and empty, or a scale that was not zeroed.
   */
  withTare: boolean;
  groups: CageGroupRow[];
}

export interface BatchWeighingFormErrors {
  date?: string;
  averageWeight?: string;
  headCount?: string;
  shrinkPct?: string;
  groups?: string;
  rows?: Record<number, string>;
}

let nextKey = 1;

export const emptyGroup = (): CageGroupRow => ({ key: nextKey++, headCount: '', gross: '', tare: '0' });

const today = () => new Date().toISOString().split('T')[0];

export function initialBatchWeighingState(type?: WeighingType): BatchWeighingFormState {
  return {
    type: type?.code ?? 'BATCH_CONTROL',
    date: today(),
    time: '',
    shrunkCondition: type?.default_shrunk_condition ?? 'FULL_WEIGHT',
    shrinkPct: '',
    observations: '',
    entry: 'AVERAGE',
    averageWeight: '',
    headCount: '',
    withTare: false,
    groups: [emptyGroup()],
  };
}

export const toGroupInput = (row: CageGroupRow): CageGroupInput => ({
  head_count: Number(row.headCount) || 0,
  gross_weight: Number(row.gross) || 0,
  tare_weight: Number(row.tare) || 0,
});

/** Validated on click: the button stays enabled and each faulty load is marked. */
export function validateBatchWeighing(form: BatchWeighingFormState): BatchWeighingFormErrors {
  const errors: BatchWeighingFormErrors = {};
  const rows: Record<number, string> = {};

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

  if (form.entry === 'AVERAGE') {
    const average = Number(form.averageWeight);
    const heads = Number(form.headCount);
    if (form.averageWeight.trim() === '' || !(average > 0)) {
      errors.averageWeight = 'Indicá el promedio por cabeza.';
    } else if (average > 1200) {
      errors.averageWeight = 'Más de 1.200 kg/cab no es posible.';
    }
    if (!Number.isInteger(heads) || heads < 1) {
      errors.headCount = 'Indicá las cabezas pesadas.';
    }

    return errors;
  }

  form.groups.forEach((row, index) => {
    const g = toGroupInput(row);
    if (!Number.isInteger(g.head_count) || g.head_count < 1) {
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

  return errors;
}

export const hasErrors = (errors: BatchWeighingFormErrors) => Object.keys(errors).length > 0;

export function toBatchWeighingPayload(batchId: number, form: BatchWeighingFormState): RegisterBatchWeighingPayload {
  return {
    batch_id: batchId,
    weighing_type: form.type,
    weighing_date: form.date,
    weighing_time: form.time || null,
    shrunk_condition: form.shrunkCondition,
    shrink_pct: form.shrunkCondition === 'CALCULATED' ? Number(form.shrinkPct) : null,
    observations: form.observations.trim() || null,
    entry: form.entry,
    ...(form.entry === 'AVERAGE'
      ? { average_weight: Number(form.averageWeight), head_count: Number(form.headCount) }
      : { groups: form.groups.map(toGroupInput) }),
  };
}

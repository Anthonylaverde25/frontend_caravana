import {
  CaravanWeightRecord,
  RecordCaravanWeightPayload,
  ShrunkCondition,
  WeighingMethod,
  WeighingType,
  WeighingTypeCode,
} from '@/core/weighing/domain/entities/Weighing';
import { PreviousWeight } from '@/core/weighing/domain/services/weighingSanity';

export interface CaravanWeightFormState {
  weight: string;
  date: string;
  time: string;
  type: WeighingTypeCode;
  method: WeighingMethod;
  shrunkCondition: ShrunkCondition;
  shrinkPct: string;
  notes: string;
}

export type CaravanWeightFormErrors = Partial<Record<'weight' | 'date' | 'shrinkPct', string>>;

export const today = () => new Date().toISOString().split('T')[0];

export function initialFormState(type?: WeighingType): CaravanWeightFormState {
  return {
    weight: '',
    date: today(),
    time: '',
    type: type?.code ?? 'CONTROL',
    method: type?.default_method === 'AVERAGE' ? 'INDIVIDUAL' : (type?.default_method ?? 'INDIVIDUAL'),
    shrunkCondition: type?.default_shrunk_condition ?? 'FULL_WEIGHT',
    shrinkPct: '',
    notes: '',
  };
}

/** Validated on click: the button stays enabled and the missing fields are marked. */
export function validateForm(form: CaravanWeightFormState): CaravanWeightFormErrors {
  const errors: CaravanWeightFormErrors = {};
  const weight = Number(form.weight);

  if (form.weight.trim() === '' || !Number.isFinite(weight) || weight <= 0) {
    errors.weight = 'Ingresá un peso mayor a 0 kg.';
  }

  if (!form.date) {
    errors.date = 'Indicá la fecha del pesaje.';
  }

  if (form.shrunkCondition === 'CALCULATED') {
    const pct = Number(form.shrinkPct);
    if (form.shrinkPct.trim() === '' || !(pct > 0 && pct < 30)) {
      errors.shrinkPct = 'Indicá el % de desbaste (entre 0 y 30).';
    }
  }

  return errors;
}

export function toPayload(form: CaravanWeightFormState): RecordCaravanWeightPayload {
  return {
    weight: Number(form.weight),
    weighing_date: form.date,
    weighing_time: form.time || null,
    weighing_type: form.type,
    method: form.method,
    shrunk_condition: form.shrunkCondition,
    shrink_pct: form.shrunkCondition === 'CALCULATED' ? Number(form.shrinkPct) : null,
    notes: form.notes || undefined,
  };
}

/** The newest weighing strictly before the given day, the reference for the daily-change check. */
export function previousWeightBefore(history: CaravanWeightRecord[], date: string): PreviousWeight | null {
  const earlier = history
    .filter((w) => w.weighing_date < date)
    .sort((a, b) => b.weighing_date.localeCompare(a.weighing_date));

  return earlier.length > 0 ? { weight: earlier[0].weight, date: earlier[0].weighing_date } : null;
}

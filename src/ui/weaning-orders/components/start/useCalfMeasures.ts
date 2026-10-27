import { useCallback, useState } from 'react';
import { CalfDraft, emptyCalf, WeaningOrderStart } from '../../hooks/useWeaningOrderForm';

/** What the chute measured of one calf, as typed on the grid. */
export interface CalfMeasure {
  weight: string;
  observations: string;
}

const EMPTY: CalfMeasure = { weight: '', observations: '' };

/** A weight left blank is fine (the calf keeps its last one); one typed must be a positive number. */
export const isValidWeight = (weight: string): boolean => {
  const value = weight.trim();

  return value === '' || Number(value.replace(',', '.')) > 0;
};

/**
 * The weaning weight and notes of each calf when the weaning already happened ("Registrar
 * destete", "Registrar destetadas"), typed on the grid of the start dialog. It opens with what was
 * already said ("Volver") and becomes, on "Continuar", the weight and notes of each calf.
 */
export function useCalfMeasures() {
  const [byCalf, setByCalf] = useState<Record<number, CalfMeasure>>({});

  const reset = useCallback((initial: WeaningOrderStart | null | undefined) => {
    setByCalf(
      Object.fromEntries(
        Object.entries(initial?.calves ?? {}).map(([id, calf]) => [Number(id), { weight: calf.weight, observations: calf.observations }])
      )
    );
  }, []);

  const valueOf = (calfId: number): CalfMeasure => byCalf[calfId] ?? EMPTY;

  const set = (calfId: number, patch: Partial<CalfMeasure>) =>
    setByCalf((prev) => ({ ...prev, [calfId]: { ...(prev[calfId] ?? EMPTY), ...patch } }));

  /** Calves whose typed weight is not a weight, by id. */
  const invalidIds = (calfIds: number[]): number[] => calfIds.filter((id) => !isValidWeight(valueOf(id).weight));

  /** Each calf with what was measured of it, on top of what it already says. */
  const apply = (calfIds: number[], calves: Record<number, CalfDraft>): Record<number, CalfDraft> =>
    Object.fromEntries(calfIds.map((id) => [id, { ...(calves[id] ?? emptyCalf()), ...valueOf(id) }]));

  return { reset, valueOf, set, invalidIds, apply };
}

export type CalfMeasures = ReturnType<typeof useCalfMeasures>;

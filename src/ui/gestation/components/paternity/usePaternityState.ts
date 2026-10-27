import { useCallback, useMemo, useState } from 'react';
import type { SireIdentificationMethod } from '@/features/paternity/hooks/usePendingPaternities';
import { type PaternityState, type PaternityValue, paternityProblem, valueOf } from './paternityModel';

/**
 * Local state of the paternity sheet: one value per calf, row selection to set the method of many
 * at once, and the rows flagged on click or by the backend.
 */
export function usePaternityState() {
  const [values, setValues] = useState<PaternityState>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Record<number, string>>({});

  const unflag = useCallback((calfIds: number[]) => {
    setFlagged((prev) => {
      const next = { ...prev };
      calfIds.forEach((id) => delete next[id]);
      return next;
    });
  }, []);

  const update = useCallback(
    (calfId: number, patch: Partial<PaternityValue>) => {
      setValues((prev) => ({ ...prev, [calfId]: { ...valueOf(prev, calfId), ...patch } }));
      unflag([calfId]);
    },
    [unflag]
  );

  const applyMethod = useCallback(
    (calfIds: number[], method: SireIdentificationMethod) => {
      setValues((prev) => {
        const next = { ...prev };
        calfIds.forEach((id) => (next[id] = { ...valueOf(prev, id), method }));
        return next;
      });
      unflag(calfIds);
    },
    [unflag]
  );

  const toggleSelected = useCallback((calfId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(calfId)) next.delete(calfId);
      else next.add(calfId);
      return next;
    });
  }, []);

  const selectMany = useCallback((calfIds: number[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      calfIds.forEach((id) => (select ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  /** Flags the rows that cannot be sent; returns true when all are fine. */
  const validate = useCallback((): boolean => {
    const problems: Record<number, string> = {};
    Object.entries(values).forEach(([id, value]) => {
      const problem = paternityProblem(value);
      if (problem) problems[Number(id)] = problem;
    });
    setFlagged(problems);
    return Object.keys(problems).length === 0;
  }, [values]);

  const reset = useCallback(() => {
    setValues({});
    setSelected(new Set());
    setFlagged({});
  }, []);

  const chosenCount = useMemo(() => Object.values(values).filter((value) => value.father_id !== null).length, [values]);

  return { values, selected, flagged, chosenCount, update, applyMethod, toggleSelected, selectMany, validate, flagEach: setFlagged, reset };
}

export type PaternityController = ReturnType<typeof usePaternityState>;

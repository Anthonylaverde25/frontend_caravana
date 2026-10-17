import { useCallback, useMemo, useState } from 'react';
import {
  DiagnosisEntryState,
  DiagnosisEntryValue,
  EntryResult,
  entryOf,
  entryProblem,
  withResult,
} from './diagnosisEntryModel';

/**
 * Local state of a diagnosis round on screen: one value per female, row selection for bulk
 * actions, and the rows flagged when validating on click.
 */
export function useDiagnosisEntryState(singleBullId: number | null) {
  const [values, setValues] = useState<DiagnosisEntryState>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Record<number, string>>({});

  const update = useCallback((femaleId: number, patch: Partial<DiagnosisEntryValue>) => {
    setValues((prev) => ({ ...prev, [femaleId]: { ...entryOf(prev, femaleId), ...patch } }));
    setFlagged((prev) => {
      if (!(femaleId in prev)) return prev;
      const next = { ...prev };
      delete next[femaleId];
      return next;
    });
  }, []);

  const setResult = useCallback(
    (femaleIds: number[], result: EntryResult, extra: Partial<DiagnosisEntryValue> = {}) => {
      setValues((prev) => {
        const next = { ...prev };
        femaleIds.forEach((id) => {
          next[id] = { ...withResult(entryOf(prev, id), result, singleBullId), ...extra };
        });
        return next;
      });
      setFlagged((prev) => {
        const next = { ...prev };
        femaleIds.forEach((id) => delete next[id]);
        return next;
      });
    },
    [singleBullId]
  );

  const toggleSelected = useCallback((femaleId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(femaleId)) next.delete(femaleId);
      else next.add(femaleId);
      return next;
    });
  }, []);

  /** Adds `femaleIds` to the selection, or takes them out of it. */
  const selectMany = useCallback((femaleIds: number[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      femaleIds.forEach((id) => (select ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  /** Flags the rows of `femaleIds` that cannot be sent; returns true when all are fine. */
  const validate = useCallback(
    (femaleIds: number[], requireResult: boolean): boolean => {
      const problems: Record<number, string> = {};
      femaleIds.forEach((id) => {
        const value = entryOf(values, id);
        if (requireResult && value.result === 'UNCHECKED') {
          problems[id] = 'Falta el resultado';
          return;
        }
        const problem = entryProblem(value);
        if (problem) problems[id] = problem;
      });
      setFlagged(problems);
      return Object.keys(problems).length === 0;
    },
    [values]
  );

  const flag = useCallback((femaleIds: number[], message: string) => {
    setFlagged(Object.fromEntries(femaleIds.map((id) => [id, message])));
  }, []);

  /** Paints the backend answer on its rows, each with its own message. */
  const flagEach = useCallback((messages: Record<number, string>) => setFlagged(messages), []);

  const reset = useCallback(() => {
    setValues({});
    setSelected(new Set());
    setFlagged({});
  }, []);

  const statedCount = useMemo(
    () => Object.values(values).filter((value) => value.result !== 'UNCHECKED').length,
    [values]
  );

  return { values, selected, flagged, statedCount, update, setResult, toggleSelected, selectMany, validate, flag, flagEach, reset };
}

export type DiagnosisEntryController = ReturnType<typeof useDiagnosisEntryState>;

import { useCallback, useMemo, useState } from 'react';
import type { BirthFieldPayload } from '@/features/birth-orders/types';
import { BirthRollFemale, BirthRollValue, emptyBirthValue, rowProblem, toBirthFieldPayload } from './birthRollTypes';

/**
 * The values of the calving grid, one per female, and what can be sent. Rows without an outcome
 * are females that did not calve (yet); `resolved` are the ones that say what happened.
 */
export function useBirthRollState(females: BirthRollFemale[]) {
  const [values, setValues] = useState<Record<number, BirthRollValue>>({});

  const valueOf = useCallback((id: number): BirthRollValue => values[id] ?? emptyBirthValue(), [values]);

  const patch = useCallback((id: number, change: Partial<BirthRollValue>) => {
    setValues((prev) => ({ ...prev, [id]: { ...(prev[id] ?? emptyBirthValue()), ...change } }));
  }, []);

  /** An explicit act: the date of the round in every resolved row still without one. Never implicit. */
  const fillMissingDates = useCallback(
    (date: string) =>
      setValues((prev) => {
        const next = { ...prev };
        Object.entries(next).forEach(([id, value]) => {
          if (value.outcome !== '' && !value.birthDate) next[Number(id)] = { ...value, birthDate: date };
        });

        return next;
      }),
    []
  );

  const resolved = useMemo(() => females.filter((f) => valueOf(f.caravanId).outcome !== ''), [females, valueOf]);
  const unresolved = females.length - resolved.length;

  const problems = useMemo(
    () =>
      resolved
        .map((f) => {
          const problem = rowProblem(valueOf(f.caravanId));

          return problem ? `${f.identification}: ${problem}.` : null;
        })
        .filter((p): p is string => p !== null),
    [resolved, valueOf]
  );

  const counts = useMemo(() => {
    const byOutcome = { LIVE: 0, STILLBORN: 0, ABORTION: 0 };
    resolved.forEach((f) => {
      const outcome = valueOf(f.caravanId).outcome;

      if (outcome !== '') byOutcome[outcome] += 1;
    });

    return byOutcome;
  }, [resolved, valueOf]);

  const payload = useCallback(
    (): BirthFieldPayload[] => resolved.map((f) => toBirthFieldPayload(f, valueOf(f.caravanId))),
    [resolved, valueOf]
  );

  return { valueOf, patch, fillMissingDates, resolved, unresolved, problems, counts, payload };
}

export type BirthRollState = ReturnType<typeof useBirthRollState>;

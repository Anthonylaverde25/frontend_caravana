import { useCallback, useEffect, useMemo, useState } from 'react';
import { birthRowErrors } from '@/features/birth-orders/types';
import { cellErrorsByFemale, type BirthCellError, type BirthRollFemale, type BirthRollValue } from './birthRollTypes';
import type { BirthRollState } from './useBirthRollState';

/**
 * The server's cell errors of a refused PAR-01, cleared as the user corrects them: editing a cell
 * drops its error and the row-level ones of that female. A new refusal brings back whatever is
 * still wrong. Returns the roll state to hand to the grid, with its edits wired to the clearing.
 */
export function useBirthCellErrors(error: unknown, females: BirthRollFemale[], roll: BirthRollState) {
  const fromServer = useMemo(() => cellErrorsByFemale(birthRowErrors(error), females), [error, females]);
  const [errors, setErrors] = useState<Record<number, BirthCellError[]>>(fromServer);

  useEffect(() => setErrors(fromServer), [fromServer]);

  const patch = useCallback(
    (id: number, change: Partial<BirthRollValue>) => {
      roll.patch(id, change);
      const edited = new Set<string>(Object.keys(change));
      setErrors((prev) => {
        if (!prev[id]) return prev;

        const { [id]: row, ...rest } = prev;
        const left = row.filter((e) => e.field !== null && !edited.has(e.field));

        return left.length > 0 ? { ...rest, [id]: left } : rest;
      });
    },
    [roll]
  );

  const state = useMemo<BirthRollState>(() => ({ ...roll, patch }), [roll, patch]);

  /** Rows the refusal pointed at, whatever is left of them: a refusal without rows is a general one. */
  const refusedRows = Object.keys(fromServer).length;

  return { errors, state, refusedRows };
}

import { useCallback, useMemo, useState } from 'react';
import { CalfDraft, DestinationDraft, emptyCalf, WeaningOrderStart } from '../../hooks/useWeaningOrderForm';
import { STAY_IN_PLACE_ID } from './weaningDestinationOptions';

/** A batch the calves can be sent to, as the start dialog names it in a row. */
export interface DestinationChoice {
  ref: string;
  label: string;
}

/**
 * How the start dialog names a declared batch: an existing one (or "Quedan en su lote") by its id,
 * one to create by its key. Draft keys are minted again on every build, the batch id is not.
 */
export const refOfBatch = (batchId: number): string => `b${batchId}`;

export const refOfDraft = (draft: DestinationDraft): string =>
  draft.kind === 'new' ? draft.key : refOfBatch(draft.kind === 'stay' ? STAY_IN_PLACE_ID : (draft.batchId ?? -1));

/**
 * The batch of each calf when there is one per calf, chosen on the grid of the start dialog. It
 * opens with what the order already said (a draft, "Editar", "Registrar destetadas") and becomes,
 * on "Continuar", the destination key of each calf.
 */
export function useCalfDestinations(choices: DestinationChoice[]) {
  const [refByCalf, setRefByCalf] = useState<Record<number, string>>({});
  const valid = useMemo(() => new Set(choices.map((c) => c.ref)), [choices]);

  /** What the order already said, by the key of each of its destinations. */
  const reset = useCallback((initial: WeaningOrderStart | null | undefined) => {
    const refByKey = new Map((initial?.destinations ?? []).map((d) => [d.key, refOfDraft(d)]));
    const next: Record<number, string> = {};

    Object.entries(initial?.calves ?? {}).forEach(([id, calf]) => {
      const ref = calf.destinationKey ? refByKey.get(calf.destinationKey) : undefined;
      if (ref) next[Number(id)] = ref;
    });
    setRefByCalf(next);
  }, []);

  /** A batch taken out of the declaration leaves its calves without one. */
  const refOf = (calfId: number): string | null => {
    const ref = refByCalf[calfId];

    return ref && valid.has(ref) ? ref : null;
  };

  const assign = (calfIds: number[], ref: string | null) =>
    setRefByCalf((prev) => {
      const next = { ...prev };
      calfIds.forEach((id) => {
        if (ref) next[id] = ref;
        else delete next[id];
      });

      return next;
    });

  /** Each calf with the key of its batch among the destinations being sent. */
  const toCalves = (calfIds: number[], drafts: DestinationDraft[], base?: Record<number, CalfDraft>): Record<number, CalfDraft> => {
    const keyByRef = new Map(drafts.map((d) => [refOfDraft(d), d.key]));

    return Object.fromEntries(
      calfIds.map((id) => {
        const ref = refOf(id);

        return [id, { ...(base?.[id] ?? emptyCalf()), destinationKey: ref ? (keyByRef.get(ref) ?? null) : null }];
      })
    );
  };

  return { reset, refOf, assign, toCalves };
}

export type CalfDestinations = ReturnType<typeof useCalfDestinations>;

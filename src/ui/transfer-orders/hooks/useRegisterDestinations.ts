import { useCallback, useMemo, useState } from 'react';
import type { Cact01Destination } from '@/ui/work-templates/components/scan/types';
import type { NewBatchDraft } from '@/ui/activities/components/transfer/TransferDestinationBar';
import { emptyDestination, TransferDestinationsState } from '@/ui/activities/hooks/useTransferDestinations';
import type { TransferFormBatch } from './useTransferOrderFormOptions';

/** What the destination picker of a row offers: a batch that exists, or one declared new here. */
export type RegisterDestinationOption =
  | { kind: 'existing'; batch: TransferFormBatch }
  | { kind: 'new'; destination: Cact01Destination };

/** The "create a new batch" dialog, asked from a row or from the bulk picker. */
interface PendingNewBatch {
  caravanIds: number[];
  /** Set when editing a batch already declared new; absent when creating one. */
  key?: string;
  draft: NewBatchDraft;
}

/**
 * Per-animal destinations of a registered transfer, picked in each row instead of declared
 * first in a panel. Choosing an existing batch declares it on the fly; creating one opens the
 * new-batch dialog inside the destination activity. The declared list lives in the same
 * `useTransferDestinations` state the payload is built from, so nothing downstream changes.
 */
export function useRegisterDestinations(
  perAnimal: TransferDestinationsState,
  activityId: number | null,
  batches: TransferFormBatch[]
) {
  const [pending, setPending] = useState<PendingNewBatch | null>(null);
  const { destinations, assignments, load } = perAnimal;

  const withAssigned = useCallback(
    (nextDestinations: Cact01Destination[], caravanIds: number[], key: string) =>
      load(nextDestinations, { ...assignments, ...Object.fromEntries(caravanIds.map((id) => [id, key])) }),
    [load, assignments]
  );

  const assignExisting = useCallback(
    (caravanIds: number[], batch: TransferFormBatch) => {
      const declared = destinations.find((d) => d.mode === 'existing' && d.batchId === batch.id);

      if (declared) {
        withAssigned(destinations, caravanIds, declared.key);

        return;
      }

      const created: Cact01Destination = {
        ...emptyDestination(null, activityId),
        label: batch.name,
        name: batch.name,
        batchId: batch.id,
        touched: true
      };

      withAssigned([...destinations, created], caravanIds, created.key);
    },
    [destinations, activityId, withAssigned]
  );

  const assignDeclared = useCallback(
    (caravanIds: number[], key: string) => withAssigned(destinations, caravanIds, key),
    [destinations, withAssigned]
  );

  const requestCreate = useCallback(
    (caravanIds: number[], name: string) =>
      setPending({ caravanIds, draft: { name, activityId: activityId ?? undefined } }),
    [activityId]
  );

  const requestEdit = useCallback(
    (destination: Cact01Destination) =>
      setPending({
        caravanIds: [],
        key: destination.key,
        draft: {
          name: destination.name,
          activityId: activityId ?? undefined,
          batchTypeId: destination.batchTypeId ?? undefined,
          isConfined: destination.isConfined ?? undefined
        }
      }),
    [activityId]
  );

  /** What the dialog saved: a new batch for the rows that asked, or the edit of one. */
  const saveNewBatch = useCallback(
    (draft: NewBatchDraft) => {
      if (!pending) return;

      const fields = {
        label: draft.name.trim(),
        name: draft.name.trim(),
        batchTypeId: draft.batchTypeId ?? null,
        isConfined: draft.isConfined ?? null,
        touched: true
      };

      if (pending.key) {
        load(
          destinations.map((d) => (d.key === pending.key ? { ...d, ...fields } : d)),
          assignments
        );
      } else {
        const created: Cact01Destination = { ...emptyDestination(null, activityId), ...fields, mode: 'new' };

        withAssigned([...destinations, created], pending.caravanIds, created.key);
      }

      setPending(null);
    },
    [pending, destinations, assignments, activityId, load, withAssigned]
  );

  /** Drops a batch declared new, and the animals that pointed at it go back to unassigned. */
  const removeNew = useCallback(
    (key: string) =>
      load(
        destinations.filter((d) => d.key !== key),
        Object.fromEntries(Object.entries(assignments).filter(([, assigned]) => assigned !== key))
      ),
    [destinations, assignments, load]
  );

  const options = useMemo<RegisterDestinationOption[]>(
    () => [
      ...batches.map((batch) => ({ kind: 'existing' as const, batch })),
      ...destinations.filter((d) => d.mode === 'new').map((destination) => ({ kind: 'new' as const, destination }))
    ],
    [batches, destinations]
  );

  /** The option a row currently points at, if any. */
  const optionOf = useCallback(
    (caravanId: number): RegisterDestinationOption | null => {
      const destination = destinations.find((d) => d.key === assignments[caravanId]);

      if (!destination) return null;

      if (destination.mode === 'new') return { kind: 'new', destination };

      const batch = batches.find((b) => b.id === destination.batchId);

      return batch ? { kind: 'existing', batch } : null;
    },
    [destinations, assignments, batches]
  );

  return {
    options,
    optionOf,
    assignExisting,
    assignDeclared,
    requestCreate,
    requestEdit,
    removeNew,
    /** Clearing the picker of a row: the animal goes back to unassigned. */
    unassign: (caravanIds: number[]) => perAnimal.assign(caravanIds, null),
    pending,
    saveNewBatch,
    cancelNewBatch: () => setPending(null)
  };
}

export type RegisterDestinationsState = ReturnType<typeof useRegisterDestinations>;

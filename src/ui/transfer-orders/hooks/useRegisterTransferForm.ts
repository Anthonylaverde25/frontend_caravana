import { useMemo, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import type { RegisterTransferPayload } from '@/features/transfer-orders/types';
import type { NewBatchDraft } from '@/ui/activities/components/transfer/TransferDestinationBar';
import type { TransferPrefillDestination } from '@/ui/activities/components/transfer/transferPrefill';
import {
  TransferableCaravan,
  afterArriving,
  afterLeaving,
  figuresOfSelection,
  resolveBatchFigures
} from '@/ui/activities/components/transfer/transferMath';
import { useTransferDestinations } from '@/ui/activities/hooks/useTransferDestinations';
import { useTransferOrderDraft } from '@/ui/activities/hooks/useTransferOrderDraft';
import { toPayloadFields } from '../components/register/registerFieldData';
import { FieldSourceCaravan, useRegisterFieldData } from './useRegisterFieldData';

/** Stable: a new object per render would recompute the order draft every time. */
const NO_CATEGORY_TARGETS = {};

export interface RegisterTransferFacts {
  /** The day the animals actually moved (YYYY-MM-DD), never in the future. */
  movementDate: string;
  responsable: string;
  observations: string;
}

const localToday = (): string => {
  const now = new Date();

  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const EMPTY_BATCH: NewBatchDraft = { name: '' };

/**
 * The state of "Registrar transferencia" and what it would send.
 *
 * The payload is the one a transfer order uses, built by the same hook. What registering asks on
 * top is what ordering can leave open: the chute already happened, so every animal has its batch
 * and every new batch its type and management system.
 */
export function useRegisterTransferForm() {
  const { activeCompanyId } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId, 'own');

  const [sourceActivityId, setSourceActivityId] = useState<number | ''>('');
  const [sourceBatchId, setSourceBatchId] = useState<number | ''>('');
  const [destinationActivityId, setDestinationActivityId] = useState<number | ''>('');
  const [destination, setDestination] = useState<TransferPrefillDestination | null>(null);
  const [newBatch, setNewBatch] = useState<NewBatchDraft>(EMPTY_BATCH);
  // Nothing preselected: a registration says what moved, and a full selection invites loading more.
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [facts, setFacts] = useState<RegisterTransferFacts>(() => ({
    movementDate: localToday(),
    responsable: '',
    observations: ''
  }));

  const perAnimal = useTransferDestinations(null, destinationActivityId === '' ? null : destinationActivityId);
  const perAnimalMode = destination?.kind === 'per_animal';

  const allBatches = useMemo(() => activities.flatMap((activity) => activity.batches ?? []), [activities]);
  const sourceBatch = allBatches.find((batch) => Number(batch.id) === sourceBatchId) ?? null;
  const targetBatch =
    destination?.kind === 'existing'
      ? (allBatches.find((batch) => Number(batch.id) === destination.batchId) ?? null)
      : null;

  const ownCaravans = caravans as unknown as TransferableCaravan[];
  const sourceCaravans = useMemo(
    () => ownCaravans.filter((caravan) => sourceBatchId !== '' && Number(caravan.batch_id) === sourceBatchId),
    [ownCaravans, sourceBatchId]
  );
  const targetCaravans = useMemo(
    () => (targetBatch ? ownCaravans.filter((caravan) => Number(caravan.batch_id) === Number(targetBatch.id)) : []),
    [ownCaravans, targetBatch]
  );

  const fieldData = useRegisterFieldData(sourceCaravans as unknown as FieldSourceCaravan[], selectedIds);

  const draft = useMemo<NewBatchDraft>(
    () => ({ ...newBatch, activityId: destinationActivityId === '' ? undefined : destinationActivityId }),
    [newBatch, destinationActivityId]
  );
  const isManagementMissing = destination?.kind === 'new' && draft.isConfined !== true && draft.isConfined !== false;

  const order = useTransferOrderDraft({
    sourceBatchId: sourceBatchId === '' ? 0 : sourceBatchId,
    destinationMode: perAnimalMode ? 'per_animal' : 'single',
    destinationActivityId: destinationActivityId === '' ? null : destinationActivityId,
    selectedIds,
    mode: destination?.kind === 'existing' ? 'existing' : 'new',
    targetBatch: targetBatch ? { id: Number(targetBatch.id), name: targetBatch.name } : null,
    draft,
    isManagementMissing,
    perAnimal,
    // A registered transfer declares categories per animal, with the chute data: no order mode.
    categoryMode: 'KEEP',
    categoryTargets: NO_CATEGORY_TARGETS
  });

  const blockedReason = ((): string | null => {
    if (sourceBatchId === '') return 'Elegí el lote de origen.';

    if (destinationActivityId === '' || destination == null) return 'Elegí el destino de los animales.';

    if (order.blockedReason) return order.blockedReason;

    if (perAnimalMode) {
      const unassigned = perAnimal.unassignedCount(selectedIds);

      if (unassigned > 0) return `${unassigned} animal(es) sin lote de destino.`;

      const incomplete = perAnimal.destinations.find(
        (d) =>
          d.mode === 'new' &&
          selectedIds.some((id) => perAnimal.assignments[id] === d.key) &&
          (d.batchTypeId == null || (d.isConfined !== true && d.isConfined !== false))
      );

      if (incomplete) return `Completá el tipo y el manejo del lote nuevo ${incomplete.name.trim()}.`;
    }

    if (!facts.movementDate) return 'Indicá la fecha en que se hizo el movimiento.';

    if (facts.movementDate > localToday()) return 'La fecha del movimiento no puede ser futura.';

    return fieldData.blockedReason;
  })();

  const animalById = new Map(fieldData.animals.map((animal) => [animal.id, animal]));
  const payload: RegisterTransferPayload | null =
    blockedReason === null && order.payload
      ? {
          ...order.payload,
          movement_date: facts.movementDate,
          responsable: facts.responsable.trim() || null,
          observations: facts.observations.trim() || null,
          animals: order.payload.animals.map((animal) => {
            const known = animalById.get(animal.caravan_id);

            return known ? { ...animal, ...toPayloadFields(fieldData.drafts[animal.caravan_id], known) } : animal;
          })
        }
      : null;

  const moved = figuresOfSelection(sourceCaravans, selectedIds);
  const sourceBefore = resolveBatchFigures(sourceBatch, sourceCaravans);
  const destinationBefore = targetBatch ? resolveBatchFigures(targetBatch, targetCaravans) : null;

  const changeSourceActivity = (activityId: number | '') => {
    setSourceActivityId(activityId);
    changeSourceBatch('');
  };

  const changeSourceBatch = (batchId: number | '') => {
    setSourceBatchId(batchId);
    setSelectedIds([]);
    fieldData.clear();
    // The animals of another batch: their assignments no longer mean anything.
    perAnimal.assign(Object.keys(perAnimal.assignments).map(Number), null);

    if (destination?.kind === 'existing' && destination.batchId === batchId) setDestination(null);
  };

  const changeDestinationActivity = (activityId: number | '') => {
    setDestinationActivityId(activityId);
    setDestination(null);
    setNewBatch(EMPTY_BATCH);
    perAnimal.reset();
  };

  return {
    sourceActivityId,
    sourceBatchId,
    sourceBatch,
    destinationActivityId,
    destination,
    targetBatch,
    newBatch: draft,
    selectedIds,
    facts,
    today: localToday(),
    perAnimal,
    perAnimalMode,
    fieldData,
    sourceCaravans,
    isLoadingCaravans,
    blockedReason,
    payload,
    figures: {
      moved,
      sourceBefore,
      sourceAfter: afterLeaving(sourceBefore, moved),
      destinationBefore,
      destinationAfter: afterArriving(destinationBefore, moved)
    },
    changeSourceActivity,
    changeSourceBatch,
    changeDestinationActivity,
    setDestination,
    setNewBatch,
    setSelectedIds,
    setFacts
  };
}

export type RegisterTransferForm = ReturnType<typeof useRegisterTransferForm>;

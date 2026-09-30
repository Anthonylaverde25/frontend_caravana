import { useMemo } from 'react';
import type { EmitTransferOrderPayload, TransferOrder, TransferOrderCategoryMode } from '@/features/transfer-orders/types';
import type { CategoryTarget } from './useTransferCategoryPlan';
import type { NewBatchDraft } from '../components/transfer/TransferDestinationBar';
import type { TransferDestinationMode, TransferDestinationsState } from './useTransferDestinations';

const SINGLE_KEY = 'single';

interface DraftInput {
  sourceBatchId: number;
  destinationMode: TransferDestinationMode;
  destinationActivityId: number | null;
  selectedIds: number[];
  /** Single destination: an existing batch or a new one. */
  mode: 'existing' | 'new';
  targetBatch: { id: number; name: string } | null;
  draft: NewBatchDraft;
  isManagementMissing: boolean;
  perAnimal: TransferDestinationsState;
  categoryMode: TransferOrderCategoryMode;
  categoryTargets: Record<number, CategoryTarget | null>;
}

/**
 * What "Crear orden" would issue, built from the state of the transfer screen, and why it cannot
 * yet when it cannot.
 *
 * Ordering asks less than executing. A per-animal order may leave animals without a batch —
 * that is precisely the order that needs to go out on paper — and a batch to be created may
 * leave its type or management system for the scan to ask. What it cannot leave open is the
 * destination activity, at least one animal, and, with a single destination, which batch.
 */
export function useTransferOrderDraft({
  sourceBatchId,
  destinationMode,
  destinationActivityId,
  selectedIds,
  mode,
  targetBatch,
  draft,
  isManagementMissing,
  perAnimal,
  categoryMode,
  categoryTargets
}: DraftInput): { payload: EmitTransferOrderPayload | null; blockedReason: string | null } {
  return useMemo(() => {
    const blocked = (reason: string) => ({ payload: null, blockedReason: reason });

    if (selectedIds.length === 0) return blocked('Elegí al menos un animal.');

    if (destinationActivityId == null) return blocked('Declará la actividad de destino del movimiento.');

    const declared = categoryMode === 'DECLARED';

    if (declared && !selectedIds.some((id) => categoryTargets[id] != null)) {
      return blocked('Asigná la categoría nueva a algún animal, o elegí que no cambia o que se decide en la manga.');
    }

    const base = {
      source_batch_id: sourceBatchId,
      destination_activity_id: destinationActivityId,
      destination_mode: destinationMode,
      category_mode: categoryMode,
      movement_date: new Date().toISOString().slice(0, 10)
    };

    // Only a DECLARED order sends targets: in the other modes they would be dropped anyway.
    const targetOf = (id: number) => {
      const target = declared ? categoryTargets[id] : null;

      return {
        target_category_id: target?.categoryId ?? null,
        target_subcategory_id: target?.subcategoryId ?? null
      };
    };

    if (destinationMode === 'single') {
      if (mode === 'existing' && !targetBatch) return blocked('Elegí el lote de destino.');

      if (mode === 'new' && (!draft.name.trim() || !draft.batchTypeId || isManagementMissing)) {
        return blocked('Completá el lote nuevo: nombre, tipo y manejo.');
      }

      return {
        blockedReason: null,
        payload: {
          ...base,
          destinations: [
            mode === 'existing'
              ? {
                  key: SINGLE_KEY,
                  label: targetBatch!.name,
                  target_batch_id: targetBatch!.id,
                  new_batch_name: null,
                  new_batch_type_id: null,
                  is_confined: null
                }
              : {
                  key: SINGLE_KEY,
                  label: draft.name.trim(),
                  target_batch_id: null,
                  new_batch_name: draft.name.trim(),
                  new_batch_type_id: draft.batchTypeId ?? null,
                  is_confined: draft.isConfined ?? null
                }
          ],
          animals: selectedIds.map((id) => ({ caravan_id: id, destination_key: SINGLE_KEY, ...targetOf(id) }))
        }
      };
    }

    // Per animal: only the destinations some selected animal points at travel. One declared
    // and left empty would print nothing and order nothing.
    const used = perAnimal.destinations.filter((d) => selectedIds.some((id) => perAnimal.assignments[id] === d.key));

    for (const destination of used) {
      if (destination.mode === 'existing' && destination.batchId == null) {
        return blocked(`Elegí el lote existente de ${destination.name.trim() || 'un destino'}.`);
      }

      if (destination.mode === 'new' && !destination.name.trim()) {
        return blocked('Falta el nombre de uno de los lotes nuevos.');
      }
    }

    const names = used.map((d) => d.name.trim().toUpperCase());

    if (new Set(names).size !== names.length) {
      return blocked('Hay dos destinos que apuntan al mismo lote. Uní los dos grupos en uno solo.');
    }

    const usedKeys = new Set(used.map((d) => d.key));

    return {
      blockedReason: null,
      payload: {
        ...base,
        destinations: used.map((d) => ({
          key: d.key,
          label: d.name.trim(),
          target_batch_id: d.mode === 'existing' ? d.batchId : null,
          new_batch_name: d.mode === 'new' ? d.name.trim() : null,
          new_batch_type_id: d.mode === 'new' ? d.batchTypeId : null,
          is_confined: d.mode === 'new' ? d.isConfined : null
        })),
        animals: selectedIds.map((id) => {
          const key = perAnimal.assignments[id];

          return { caravan_id: id, destination_key: key && usedKeys.has(key) ? key : null, ...targetOf(id) };
        })
      }
    };
  }, [
    sourceBatchId,
    destinationMode,
    destinationActivityId,
    selectedIds,
    mode,
    targetBatch,
    draft,
    isManagementMissing,
    perAnimal.destinations,
    perAnimal.assignments,
    categoryMode,
    categoryTargets
  ]);
}

type SignatureDestination = {
  label: string;
  target: number | null;
  name: string | null;
  type: number | null;
  confined: boolean | null;
};

/**
 * What an order says, reduced to what can differ between the screen and a saved draft.
 *
 * Destinations are compared by their name, not by their key: the screen keys them its own way
 * and the server keys them by the normalised name, so the name is what both sides share.
 */
const signature = (
  activityId: number,
  mode: string,
  categoryMode: string,
  destinations: SignatureDestination[],
  animals: [number, string | null, string | null][]
): string =>
  JSON.stringify({
    activityId,
    mode,
    categoryMode,
    destinations: [...destinations].sort((a, b) => a.label.localeCompare(b.label)),
    animals: [...animals].sort((a, b) => a[0] - b[0])
  });

const targetSignature = (categoryId?: number | null, subcategoryId?: number | null): string | null =>
  categoryId != null ? `${categoryId}:${subcategoryId ?? ''}` : null;

export const signatureOfPayload = (payload: EmitTransferOrderPayload): string => {
  const labelByKey = new Map(payload.destinations.map((d) => [d.key, d.label.trim()]));

  return signature(
    payload.destination_activity_id,
    payload.destination_mode,
    payload.category_mode ?? 'KEEP',
    payload.destinations.map((d) => ({
      label: d.label.trim(),
      target: d.target_batch_id,
      name: d.new_batch_name,
      type: d.new_batch_type_id,
      confined: d.is_confined
    })),
    payload.animals.map((a) => [
      a.caravan_id,
      a.destination_key ? (labelByKey.get(a.destination_key) ?? null) : null,
      targetSignature(a.target_category_id, a.target_subcategory_id)
    ])
  );
};

export const signatureOfOrder = (order: TransferOrder): string => {
  const labelByKey = new Map(order.destinations.map((d) => [d.key, d.label.trim()]));

  return signature(
    order.destination_activity.id,
    order.destination_mode,
    order.category_mode ?? 'KEEP',
    order.destinations.map((d) => ({
      label: d.label.trim(),
      target: d.target_batch_id,
      name: d.new_batch_name,
      type: d.new_batch_type_id,
      confined: d.is_confined
    })),
    order.animals.map((a) => [
      a.caravan_id,
      a.destination_key ? (labelByKey.get(a.destination_key) ?? null) : null,
      targetSignature(a.target_category_id, a.target_subcategory_id)
    ])
  );
};

import { useCallback, useMemo, useState } from 'react';
import type { TransferRowError } from '@/features/transfer-orders/types';
import {
  RegisterFieldAnimal,
  RegisterFieldDraft,
  countChanges,
  fieldDraftError
} from '../components/register/registerFieldData';

/** What the caravans list carries that the chute data is compared against. */
export interface FieldSourceCaravan {
  id: number;
  identification: string;
  sex?: 'M' | 'H' | null;
  current_weight?: number | null;
  teeth?: number | null;
  category_id?: number | null;
  category_name?: string | null;
  subcategory_id?: number | null;
  active_gestation?: { gestation_months?: number | null } | null;
}

export interface ValidationBody {
  row_errors?: TransferRowError[];
  errors?: Record<string, string[]>;
}

/**
 * The chute data of a registered transfer: what was typed for each selected animal, and what
 * the server said was wrong with it, on the row it belongs to.
 */
export function useRegisterFieldData(caravans: FieldSourceCaravan[], selectedIds: number[]) {
  const [drafts, setDrafts] = useState<Record<number, RegisterFieldDraft>>({});
  const [serverErrors, setServerErrors] = useState<Record<number, string[]>>({});

  const animals = useMemo<RegisterFieldAnimal[]>(() => {
    const selected = new Set(selectedIds);

    return caravans
      .filter((caravan) => selected.has(caravan.id))
      .map((caravan) => ({
        id: caravan.id,
        identification: caravan.identification,
        sex: caravan.sex ?? null,
        currentWeight: caravan.current_weight ?? null,
        teeth: caravan.teeth ?? null,
        categoryId: caravan.category_id ?? null,
        subcategoryId: caravan.subcategory_id ?? null,
        gestationMonths: caravan.active_gestation?.gestation_months ?? null,
        categoryName: caravan.category_name ?? null
      }));
  }, [caravans, selectedIds]);

  const update = useCallback((caravanId: number, patch: Partial<RegisterFieldDraft>) => {
    setDrafts((prev) => ({ ...prev, [caravanId]: { ...prev[caravanId], ...patch } }));
    setServerErrors((prev) => {
      if (!prev[caravanId]) return prev;

      const next = { ...prev };
      delete next[caravanId];

      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setDrafts({});
    setServerErrors({});
  }, []);

  /**
   * Spreads a 422 over the rows: CACT-01 names the caravan, request validation names the index
   * of the animal in the payload that was sent.
   */
  const applyServerErrors = useCallback(
    (body: ValidationBody | undefined, sentCaravanIds: number[]) => {
      const byId: Record<number, string[]> = {};
      const idByTag = new Map(caravans.map((caravan) => [caravan.identification.toUpperCase(), caravan.id]));
      const push = (id: number | undefined, message: string) => {
        if (id == null) return;

        byId[id] = [...(byId[id] ?? []), message];
      };

      body?.row_errors?.forEach((row) =>
        row.errors.forEach((error) => push(idByTag.get(row.caravana.toUpperCase()), error.message))
      );

      Object.entries(body?.errors ?? {}).forEach(([field, messages]) => {
        const match = /^animals\.(\d+)\./.exec(field);

        if (match) messages.forEach((message) => push(sentCaravanIds[Number(match[1])], message));
      });

      setServerErrors(byId);

      return Object.keys(byId).length > 0;
    },
    [caravans]
  );

  const errorOf = (caravanId: number): string | null =>
    fieldDraftError(drafts[caravanId]) ?? serverErrors[caravanId]?.[0] ?? null;

  const firstInvalid = animals.find((animal) => fieldDraftError(drafts[animal.id]) !== null) ?? null;

  return {
    animals,
    drafts,
    update,
    clear,
    applyServerErrors,
    errorOf,
    blockedReason: firstInvalid ? `Revisá los datos de campo de ${firstInvalid.identification}.` : null,
    changes: countChanges(drafts, animals)
  };
}

export type RegisterFieldDataState = ReturnType<typeof useRegisterFieldData>;

import { useEffect, useMemo, useRef } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import {
  TransferableCaravan,
  figuresOfSelection,
} from '@/ui/activities/components/transfer/transferMath';
import { useCact01Print } from '../templates/cact01/Cact01PrintContext';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { labelOfPair } from '@/features/categories/categoryLabels';

const DENTITION_LABELS: Record<number, string> = { 0: 'DL', 2: '2D', 4: '4D', 6: '6D', 8: '8D' };

export interface Cact01SourceCaravan extends TransferableCaravan {
  teeth?: number | null;
}

interface Options {
  /**
   * Whether this caller is the one that writes the animals into the print context.
   *
   * Exactly one caller publishes. This used to live inside the config drawer, which MUI
   * does not mount while it is closed: printing without opening the drawer produced blank
   * pages even though the transfer screen had already chosen the animals. The sheet cannot
   * depend on a dialog nobody opened.
   */
  publish?: boolean;
}

/**
 * The animals of the source batch, ready for the printable sheet.
 *
 * Also the place where a work order from the transfer screen lands: the order names who
 * travels, and the picker works in exclusions, so everyone else in the batch is unticked.
 */
export function useCact01SourceAnimals({ publish = false }: Options = {}) {
  const { activeCompanyId } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: caravans = [] } = useCaravans(activeCompanyId, 'own');

  const {
    sourceBatchId,
    excludedCaravanIds: excludedIds,
    setExcludedCaravanIds: setExcludedIds,
    setAnimals,
    orderCaravanIds,
    orderAssignments,
    orderCategoryTargets,
    rollAnimals,
  } = useCact01Print();
  const { categories } = useAnimalCategories();

  const batchOptions = useMemo(
    () =>
      activities
        .filter((activity) => activity.isEnabled !== false)
        .flatMap((activity) =>
          (activity.batches ?? []).map((batch) => ({
            id: batch.id,
            name: batch.name,
            count: batch.count,
            activityName: activity.name,
          }))
        )
        .filter((batch) => batch.count > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [activities]
  );

  const candidates = useMemo<Cact01SourceCaravan[]>(
    () =>
      (caravans as unknown as Cact01SourceCaravan[])
        .filter((caravan) => caravan.batch_id === sourceBatchId)
        .sort((a, b) => a.identification.localeCompare(b.identification)),
    [caravans, sourceBatchId]
  );

  const selectedIds = useMemo(
    () => candidates.filter((c) => !excludedIds.has(c.id)).map((c) => c.id),
    [candidates, excludedIds]
  );

  const figures = useMemo(() => figuresOfSelection(candidates, selectedIds), [candidates, selectedIds]);

  // Applied once per order: unticking an animal afterwards must survive a background
  // refetch of the caravan list.
  const didApplyOrder = useRef(false);

  useEffect(() => {
    if (!publish || didApplyOrder.current || !orderCaravanIds || candidates.length === 0) return;

    const travelling = new Set(orderCaravanIds);

    setExcludedIds(new Set(candidates.filter((c) => !travelling.has(c.id)).map((c) => c.id)));
    didApplyOrder.current = true;
  }, [publish, orderCaravanIds, candidates, setExcludedIds]);

  useEffect(() => {
    if (!publish) return;

    // A closed order prints its roll as it was, not whoever is in the batch today.
    if (rollAnimals) {
      setAnimals(rollAnimals);
      return;
    }

    setAnimals(
      candidates
        .filter((caravan) => !excludedIds.has(caravan.id))
        .map((caravan) => ({
          caravanId: caravan.id,
          identification: caravan.identification,
          sex: caravan.sex ?? null,
          // In the C/S form the scan reads back; the plain name while the catalog loads.
          category:
            labelOfPair(categories, caravan.category_id, caravan.subcategory_id) ??
            caravan.category_name ??
            caravan.category ??
            null,
          categoryNew: orderCategoryTargets?.[caravan.id] ?? null,
          teeth: caravan.teeth != null ? DENTITION_LABELS[caravan.teeth] ?? String(caravan.teeth) : null,
          currentWeight: caravan.current_weight != null ? Number(caravan.current_weight) : null,
          destino: orderAssignments?.[caravan.id]?.lote ?? null,
          // Blank when the batch does not declare it, and blank when there is no batch yet:
          // in both cases the letter is something the chute still has to write.
          manejo: orderAssignments?.[caravan.id]?.manejo || null,
        }))
    );
  }, [publish, candidates, excludedIds, setAnimals, orderAssignments, orderCategoryTargets, categories, rollAnimals]);

  return { batchOptions, candidates, figures, dentitionLabels: DENTITION_LABELS };
}

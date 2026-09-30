import { useCallback, useMemo, useState } from 'react';
import type { TransferOrder, TransferOrderCategoryMode } from '@/features/transfer-orders/types';
import type { TransferableCaravan } from '../components/transfer/transferMath';

/** The new C/S of one animal. */
export interface CategoryTarget {
  categoryId: number;
  subcategoryId: number | null;
}

/** Animals that share category and sex: what the desk usually decides together. */
export interface CategoryGroup {
  key: string;
  categoryLabel: string;
  sex: 'M' | 'H' | null;
  caravanIds: number[];
  /** The target every animal of the group shares, or null when they differ or have none. */
  sharedTarget: CategoryTarget | null;
}

export interface TransferCategoryPlan {
  mode: TransferOrderCategoryMode;
  setMode: (mode: TransferOrderCategoryMode) => void;
  targets: Record<number, CategoryTarget | null>;
  groups: CategoryGroup[];
  assignGroup: (groupKey: string, target: CategoryTarget | null) => void;
  assignAnimal: (caravanId: number, target: CategoryTarget | null) => void;
  /** How many of the selected animals get a new category. */
  assignedCount: number;
  load: (order: TransferOrder) => void;
}

const sameTarget = (a: CategoryTarget | null | undefined, b: CategoryTarget | null | undefined): boolean =>
  (a ?? null) === null
    ? (b ?? null) === null
    : (b ?? null) !== null && a!.categoryId === b!.categoryId && a!.subcategoryId === b!.subcategoryId;

const labelOf = (caravan: TransferableCaravan): string => {
  const category = caravan.category_name ?? caravan.category ?? null;

  if (!category) return 'Sin categoría';

  return caravan.subcategory_name ? `${category} / ${caravan.subcategory_name}` : category;
};

/**
 * Whether the animals of the order change category, and to which.
 *
 * The target is kept per animal, because an order of male and female calves needs Novillito for
 * some and Vaquillona for others. The screen offers it grouped by current category and sex, which
 * is how it is decided at the desk, and lets any animal be adjusted after that.
 */
export function useTransferCategoryPlan(caravans: TransferableCaravan[], selectedIds: number[]): TransferCategoryPlan {
  const [mode, setMode] = useState<TransferOrderCategoryMode>('KEEP');
  const [targets, setTargets] = useState<Record<number, CategoryTarget | null>>({});

  const groups = useMemo<CategoryGroup[]>(() => {
    const selected = new Set(selectedIds);
    const byKey = new Map<string, CategoryGroup>();

    caravans
      .filter((caravan) => selected.has(caravan.id))
      .forEach((caravan) => {
        const label = labelOf(caravan);
        const sex = caravan.sex ?? null;
        const key = `${label}|${sex ?? '-'}`;
        const group = byKey.get(key) ?? { key, categoryLabel: label, sex, caravanIds: [], sharedTarget: null };

        group.caravanIds.push(caravan.id);
        byKey.set(key, group);
      });

    return [...byKey.values()]
      .map((group) => {
        const first = targets[group.caravanIds[0]] ?? null;
        const shared = group.caravanIds.every((id) => sameTarget(targets[id], first)) ? first : null;

        return { ...group, sharedTarget: shared };
      })
      .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel) || (a.sex ?? '').localeCompare(b.sex ?? ''));
  }, [caravans, selectedIds, targets]);

  const assignGroup = useCallback(
    (groupKey: string, target: CategoryTarget | null) => {
      const group = groups.find((g) => g.key === groupKey);

      if (!group) return;

      setTargets((current) => ({
        ...current,
        ...Object.fromEntries(group.caravanIds.map((id) => [id, target]))
      }));
    },
    [groups]
  );

  const assignAnimal = useCallback((caravanId: number, target: CategoryTarget | null) => {
    setTargets((current) => ({ ...current, [caravanId]: target }));
  }, []);

  const load = useCallback((order: TransferOrder) => {
    setMode(order.category_mode ?? 'KEEP');
    setTargets(
      Object.fromEntries(
        order.animals
          .filter((a) => a.target_category_id != null)
          .map((a) => [a.caravan_id, { categoryId: a.target_category_id!, subcategoryId: a.target_subcategory_id }])
      )
    );
  }, []);

  const assignedCount = selectedIds.filter((id) => targets[id] != null).length;

  return { mode, setMode, targets, groups, assignGroup, assignAnimal, assignedCount, load };
}

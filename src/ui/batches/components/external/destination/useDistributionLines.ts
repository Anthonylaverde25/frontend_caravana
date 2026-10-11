import { useMemo } from 'react';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import type { DistributionLine } from './coverage';

/**
 * The category lines of the form as the distribution needs them: their number on the order, name,
 * sex (from the catalogue) and head. A line without a category yet is left out.
 */
export function useDistributionLines(
  categories: { category_id?: number | null; head_count?: unknown }[] | undefined
): DistributionLine[] {
  const { data: catalogue = [] } = useAnimalCategories();

  // The form mutates its field array in place: the key is what tells a change apart.
  const key = JSON.stringify((categories ?? []).map((line) => [line.category_id ?? null, line.head_count ?? null]));

  return useMemo(
    () =>
      (JSON.parse(key) as [number | null, unknown][]).flatMap(([categoryId, rawHead], index) => {
        if (categoryId == null) return [];

        const category = catalogue.find((c) => c.id === categoryId);
        const head = rawHead === '' || rawHead == null ? null : Number(rawHead);

        return [
          {
            position: index + 1,
            categoryName: category?.name ?? `Categoría ${index + 1}`,
            categorySex: category?.sex ?? null,
            headCount: Number.isFinite(head) ? head : null
          }
        ];
      }),
    [key, catalogue]
  );
}

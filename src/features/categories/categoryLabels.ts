import type { AnimalCategory, AnimalSubcategory } from '@/core/categories/domain/entities/AnimalCategory';

/**
 * One value a C/S cell can hold: a category, or a category narrowed to one of its subcategories.
 */
export interface CategoryOption {
  /** `${categoryId}:${subcategoryId}`, stable enough to key a select. */
  key: string;
  categoryId: number;
  subcategoryId: number | null;
  /** The C/S label: "Novillito", "Vaquillona / Reposición". */
  label: string;
  /** The category name, to group the options under. */
  group: string;
  sex: AnimalCategory['sex'];
}

const firstWord = (value: string): string => value.trim().split(/\s+/)[0] ?? '';

/**
 * "Vaquillona de Reposición" is written "Reposición" under Vaquillona: the category's first word,
 * and a "de" after it, add nothing once the category is known.
 *
 * Deliberately the same rule as AnimalCategoryTextResolver::label() on the backend and
 * `category_labels` in the ai-agent: the sheet prints this label, the scanner is taught it, and
 * the backend must resolve it back to the same pair.
 */
export const shortSubcategoryName = (category: AnimalCategory, subcategory: AnimalSubcategory): string => {
  const name = subcategory.name.trim();
  const prefix = firstWord(category.name);

  if (prefix && name.toLowerCase().startsWith(`${prefix.toLowerCase()} `)) {
    const short = name.slice(prefix.length).trim().replace(/^de\s+/i, '').trim();

    return short || name;
  }

  return name;
};

export const categoryLabel = (category: AnimalCategory, subcategory?: AnimalSubcategory | null): string =>
  subcategory ? `${category.name} / ${shortSubcategoryName(category, subcategory)}` : category.name;

export const optionKey = (categoryId: number, subcategoryId: number | null): string =>
  `${categoryId}:${subcategoryId ?? ''}`;

/**
 * Every C/S value of the catalog, category first and its subcategories after it. With a sex, only
 * the options that can be given to an animal of that sex.
 */
export const categoryOptions = (categories: AnimalCategory[], sex?: 'M' | 'H' | null): CategoryOption[] =>
  categories
    .filter((category) => !sex || category.sex === 'BOTH' || category.sex === sex)
    .flatMap((category) => [
      {
        key: optionKey(category.id, null),
        categoryId: category.id,
        subcategoryId: null,
        label: categoryLabel(category),
        group: category.name,
        sex: category.sex
      },
      ...(category.subcategories ?? []).map((subcategory) => ({
        key: optionKey(category.id, subcategory.id),
        categoryId: category.id,
        subcategoryId: subcategory.id,
        label: categoryLabel(category, subcategory),
        group: category.name,
        sex: category.sex
      }))
    ]);

/** The C/S label of a pair, or null when the catalog does not have it (not loaded yet, say). */
export const labelOfPair = (
  categories: AnimalCategory[],
  categoryId: number | null | undefined,
  subcategoryId: number | null | undefined
): string | null => {
  const category = categories.find((c) => c.id === categoryId);

  if (!category) return null;

  return categoryLabel(category, category.subcategories?.find((s) => s.id === subcategoryId) ?? null);
};

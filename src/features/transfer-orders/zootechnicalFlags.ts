import type { AnimalCategory } from '@/core/categories/domain/entities/AnimalCategory';

/**
 * The warnings the backend gives before confirming a movement, computed on the screen so the
 * decision is taken seeing them. Deliberately the same rules as
 * ProcessCact01SubmissionUseCase::zootechnicalWarnings(): warnings, never blockers.
 */

/** Destination activities a pregnant female is warned about: finishing, and the internal ones. */
const CULL_ACTIVITIES = ['INVERNADA', 'INTERNAL'];

/** Subcategories that mean the female leaves the breeding herd. */
const CULL_SUBCATEGORIES = ['DESCARTE_CUT', 'DESCARTE_FAENA'];

export interface PregnancyFlagInput {
  /** Months of the current gestation; null when none is recorded. */
  gestationMonths: number | null | undefined;
  destinationActivityCode: string | null | undefined;
  /** The subcategory the animal ends up with: the new one, or the one it has when it keeps it. */
  subcategoryCode: string | null | undefined;
}

export const pregnantToCull = ({ gestationMonths, destinationActivityCode, subcategoryCode }: PregnancyFlagInput): boolean =>
  gestationMonths != null &&
  (CULL_ACTIVITIES.includes(destinationActivityCode ?? '') || CULL_SUBCATEGORIES.includes(subcategoryCode ?? ''));

/**
 * The range of the category when the weight falls outside it, or null. Only the category range:
 * a subcategory weight is a growth target, and being below it is not being misclassified.
 */
export const weightOutOfRange = (
  category: AnimalCategory | undefined,
  weight: number | null | undefined
): { min: number | null; max: number | null } | null => {
  if (!category || weight == null || Number.isNaN(weight)) return null;

  const min = category.min_weight_kg != null ? Number(category.min_weight_kg) : null;
  const max = category.max_weight_kg != null ? Number(category.max_weight_kg) : null;

  return (min != null && weight < min) || (max != null && weight > max) ? { min, max } : null;
};

export const formatRange = (range: { min: number | null; max: number | null }): string =>
  `${range.min != null ? Math.round(range.min) : '—'}–${range.max != null ? Math.round(range.max) : '—'} kg`;

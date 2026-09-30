import type { RegisterAnimalFields } from '@/features/transfer-orders/types';

/** A C/S value: a category, or a category narrowed to one of its subcategories. */
export interface CategoryPair {
  categoryId: number;
  subcategoryId: number | null;
}

/**
 * What was measured at the chute for one animal, as typed. Every field starts empty and empty
 * means "no change": only what changed is written.
 */
export interface RegisterFieldDraft {
  weight?: string;
  teeth?: string;
  /** The new C/S. Absent means no change. */
  category?: CategoryPair;
  observations?: string;
}

/** The animal as the system knows it, to show next to what is typed. */
export interface RegisterFieldAnimal {
  id: number;
  identification: string;
  sex: 'M' | 'H' | null;
  currentWeight: number | null;
  teeth: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  categoryName: string | null;
  /** Months of the current gestation, when one is recorded. */
  gestationMonths: number | null;
}

/** Dentition as the sheet writes it. 8D is full mouth: the parser reads no separate "BL". */
export const TEETH_OPTIONS: { value: string; teeth: number; label: string }[] = [
  { value: 'DL', teeth: 0, label: 'DL · Diente de leche' },
  { value: '2D', teeth: 2, label: '2D' },
  { value: '4D', teeth: 4, label: '4D' },
  { value: '6D', teeth: 6, label: '6D' },
  { value: '8D', teeth: 8, label: '8D · Boca llena' }
];

export const teethLabel = (teeth: number | null): string =>
  teeth == null ? '—' : (TEETH_OPTIONS.find((option) => option.teeth === teeth)?.value ?? `${teeth}D`);

/** Dentition only advances: a reading below the current one is not offered. */
export const teethOptionsFrom = (current: number | null) =>
  TEETH_OPTIONS.filter((option) => current == null || option.teeth > current);

/**
 * Whether the chosen C/S changes the animal. The same category with no subcategory chosen is
 * not a change: it keeps the subcategory the animal has, the same rule the scanned sheet follows.
 */
export const isCategoryChange = (pair: CategoryPair | undefined, animal: RegisterFieldAnimal): boolean => {
  if (!pair) return false;

  if (pair.categoryId !== animal.categoryId) return true;

  return pair.subcategoryId != null && pair.subcategoryId !== animal.subcategoryId;
};

export const parseWeight = (raw: string | undefined): number | null => {
  if (raw == null || raw.trim() === '') return null;

  const value = Number(raw.replace(',', '.'));

  return Number.isFinite(value) ? value : NaN;
};

/** Why a typed value cannot be sent, or null. */
export const fieldDraftError = (draft: RegisterFieldDraft | undefined): string | null => {
  const weight = parseWeight(draft?.weight);

  if (weight !== null && (Number.isNaN(weight) || weight <= 0)) return 'El peso tiene que ser un número mayor a cero.';

  if (weight !== null && weight > 2000) return 'El peso no puede superar los 2000 kg.';

  return null;
};

/** The fields that travel for this animal: only what changed. */
export const toPayloadFields = (draft: RegisterFieldDraft | undefined, animal: RegisterFieldAnimal): RegisterAnimalFields => {
  if (!draft) return {};

  const fields: RegisterAnimalFields = {};
  const weight = parseWeight(draft.weight);

  // An invalid weight is flagged on its row; it is neither sent nor counted as a change.
  if (weight !== null && !Number.isNaN(weight) && weight > 0 && weight <= 2000) fields.current_weight = weight;

  if (draft.teeth) fields.teeth = draft.teeth;

  if (draft.category && isCategoryChange(draft.category, animal)) {
    fields.category_id = draft.category.categoryId;
    fields.subcategory_id = draft.category.subcategoryId;
  }

  if (draft.observations?.trim()) fields.observations = draft.observations.trim();

  return fields;
};

export interface FieldChangeCounts {
  weights: number;
  teeth: number;
  categories: number;
  observations: number;
}

export const countChanges = (
  drafts: Record<number, RegisterFieldDraft>,
  animals: RegisterFieldAnimal[]
): FieldChangeCounts =>
  animals.reduce(
    (counts, animal) => {
      const fields = toPayloadFields(drafts[animal.id], animal);

      return {
        weights: counts.weights + (fields.current_weight != null ? 1 : 0),
        teeth: counts.teeth + (fields.teeth ? 1 : 0),
        categories: counts.categories + (fields.category_id != null ? 1 : 0),
        observations: counts.observations + (fields.observations ? 1 : 0)
      };
    },
    { weights: 0, teeth: 0, categories: 0, observations: 0 }
  );

/** "3 pesos, 1 categoría": what the confirmation repeats before writing it. */
export const describeChanges = (counts: FieldChangeCounts): string | null => {
  const parts = [
    counts.weights && `${counts.weights} ${counts.weights === 1 ? 'peso' : 'pesos'}`,
    counts.teeth && `${counts.teeth} ${counts.teeth === 1 ? 'dentición' : 'denticiones'}`,
    counts.categories && `${counts.categories} ${counts.categories === 1 ? 'categoría' : 'categorías'}`,
    counts.observations && `${counts.observations} ${counts.observations === 1 ? 'observación' : 'observaciones'}`
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : null;
};

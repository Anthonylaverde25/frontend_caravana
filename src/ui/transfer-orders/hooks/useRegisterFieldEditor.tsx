import { useMemo } from 'react';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import type { TransferFieldEditor } from '@/ui/activities/components/transfer/TransferAnimalsTable';
import type { CategoryChangeFlag } from '@/components/caravan/CategoryChangeCell';
import { formatRange, pregnantToCull, weightOutOfRange } from '@/features/transfer-orders/zootechnicalFlags';
import {
  RegisterFieldAnimal,
  RegisterFieldDraft,
  fieldDraftError,
  isCategoryChange,
  parseWeight,
  teethLabel
} from '../components/register/registerFieldData';
import {
  CategoryChangeInput,
  ObservationsInput,
  TeethSelect,
  WeightInput
} from '../components/register/fields/RegisterFieldInputs';
import type { FieldSourceCaravan, RegisterFieldDataState } from './useRegisterFieldData';

/**
 * Plugs the chute data of a registered transfer into the animals table: the editors of each
 * selected row, the dentition of the rest, and the error the server gave for an animal.
 */
export function useRegisterFieldEditor(
  state: RegisterFieldDataState,
  caravans: FieldSourceCaravan[],
  /** Code of the declared destination activity: a pregnant female to finishing is warned about. */
  destinationActivityCode: string | null = null
): TransferFieldEditor {
  const { categories } = useAnimalCategories();

  /** The warnings the backend will give for this row, seen before confirming. */
  const flagsOf = (animal: RegisterFieldAnimal, draft: RegisterFieldDraft | undefined): CategoryChangeFlag[] => {
    const change = isCategoryChange(draft?.category, animal) ? draft?.category : undefined;
    const pair = change ?? (animal.categoryId != null ? { categoryId: animal.categoryId, subcategoryId: animal.subcategoryId } : null);
    const category = categories.find((c) => c.id === pair?.categoryId);
    const subcategoryCode = category?.subcategories?.find((s) => s.id === pair?.subcategoryId)?.code ?? null;
    const flags: CategoryChangeFlag[] = [];

    if (pregnantToCull({ gestationMonths: animal.gestationMonths, destinationActivityCode, subcategoryCode })) {
      flags.push({
        label: `Preñada · ${animal.gestationMonths} m`,
        tooltip: 'Tiene preñez registrada y va a terminación o a descarte. Se puede confirmar igual.'
      });
    }

    if (change) {
      const typed = parseWeight(draft?.weight);
      const range = weightOutOfRange(category, typed != null && !Number.isNaN(typed) ? typed : animal.currentWeight);

      if (range) {
        flags.push({
          label: 'Peso fuera de rango',
          tooltip: `El rango de ${category?.name} es ${formatRange(range)}. Se puede confirmar igual.`
        });
      }
    }

    return flags;
  };
  const teethById = useMemo(() => new Map(caravans.map((caravan) => [caravan.id, caravan.teeth ?? null])), [caravans]);
  const animalById = useMemo(() => new Map(state.animals.map((animal) => [animal.id, animal])), [state.animals]);

  return useMemo<TransferFieldEditor>(() => {
    const props = (caravanId: number) => {
      const animal = animalById.get(caravanId);

      return animal
        ? { animal, draft: state.drafts[caravanId], onChange: (patch: object) => state.update(caravanId, patch) }
        : null;
    };

    return {
      renderWeight: (id) => {
        const p = props(id);

        return p && <WeightInput {...p} invalid={fieldDraftError(p.draft) !== null} />;
      },
      renderCategory: (id) => {
        const p = props(id);

        return p && <CategoryChangeInput {...p} flags={flagsOf(p.animal, p.draft)} />;
      },
      renderTeeth: (id) => {
        const p = props(id);

        return p && <TeethSelect {...p} />;
      },
      renderObservations: (id) => {
        const p = props(id);

        return p && <ObservationsInput {...p} />;
      },
      teethOf: (id) => teethLabel(teethById.get(id) ?? null),
      errorOf: (id) => state.errorOf(id)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalById, state, categories, teethById, destinationActivityCode]);
}

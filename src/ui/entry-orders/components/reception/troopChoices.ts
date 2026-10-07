import { categoriesAdmitting } from '@/features/entry-orders/categoryLines';
import type { ReceptionRow, ReceptionTroopContext } from './useReceptionRows';

const SEX_WORD = { M: 'Macho', H: 'Hembra' } as const;

/**
 * What a caravan can say about its sex, category, breed and coat, given the order: each one is
 * either fixed by the order (`fixed`, shown and not asked) or chosen among `options`. Breed and coat
 * are chosen apart — first the breed, then the coats the order has for it — and together name one
 * breed line of the order.
 */
export const troopChoicesOf = (row: ReceptionRow, troop: ReceptionTroopContext) => {
  const sex = row.sex || troop.inheritedSex;
  const line = troop.breeds.find((b) => b.position === row.breed_position);
  const breedNames = [...new Set(troop.breeds.map((b) => b.breedName))];
  const breedName = line?.breedName ?? (row.breed_name || (breedNames.length === 1 ? breedNames[0] : ''));
  const coats = troop.breeds.filter((b) => b.breedName === breedName);
  const categories = sex ? categoriesAdmitting(troop.categories, sex) : troop.categories;

  return {
    sex: troop.isMixed ? { options: (['M', 'H'] as const).map((value) => ({ value, label: SEX_WORD[value] })) } : { fixed: troop.inheritedSex ? SEX_WORD[troop.inheritedSex] : '—' },
    // Without CAT per animal, the category follows from the sex: one per sex at most.
    category:
      troop.needsCategory && categories.length > 1
        ? { options: categories.map((c) => ({ value: c.position, label: c.name ?? String(c.position) })) }
        : { fixed: categories.length === 1 ? (categories[0].name ?? '—') : sex ? '—' : 'Según el sexo' },
    breed: breedNames.length > 1 ? { options: breedNames.map((name) => ({ value: name, label: name })), value: breedName } : { fixed: breedNames[0] ?? 'Sin declarar' },
    coat:
      coats.length > 1
        ? { options: coats.map((c) => ({ value: c.position, label: c.colorName ?? 'Sin pelaje' })) }
        : { fixed: coats.length === 1 ? (coats[0].colorName ?? '—') : '—' }
  };
};

/** Choosing a breed: its only line when the order has it in one coat; otherwise the coat is still to choose. */
export const breedPatchOf = (troop: ReceptionTroopContext, name: string): Partial<ReceptionRow> => {
  const lines = troop.breeds.filter((b) => b.breedName === name);

  return { breed_name: name, breed_position: lines.length === 1 ? lines[0].position : '' };
};

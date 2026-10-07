import { categoriesAdmitting, inheritedSexOf } from './categoryLines';
import type { EntryOrder } from './types';

/**
 * A troop datum either holds for every animal of the order — printed once, in the TROPA band of the
 * ING-03 and as a chip over the manual grid — or is left to each line, with its own column.
 */
export type TroopField =
  | { mode: 'GLOBAL'; value: string }
  | {
      mode: 'PER_LINE';
      /** What a line can say, in words: "Braford Colorado", "Novillito". */
      expected: string[];
      /** The same, by the header's reference: "A = Braford Colorado", "1 = Novillito". */
      codes: string[];
    };

export interface TroopDefaults {
  sex: TroopField;
  /** Global also when each sex admits one category: "M = Novillito · H = Vaquillona". */
  category: TroopField;
  /** A breed line is breed and coat: "Braford Colorado". */
  breed: TroopField;
}

type TroopSource = Pick<EntryOrder, 'sex_composition' | 'sex_composition_label' | 'breeds' | 'categories' | 'needs_category_per_animal'>;

const SEX_WORD: Record<'M' | 'H', string> = { M: 'Macho', H: 'Hembra' };

/**
 * What the order fixes for every animal and what it leaves to each line. The paper and the screen
 * both read it from here, so they cannot disagree.
 */
export const troopDefaultsOf = (order: TroopSource): TroopDefaults => {
  const inherited = inheritedSexOf(order.sex_composition);

  const sex: TroopField = inherited
    ? { mode: 'GLOBAL', value: order.sex_composition_label ?? SEX_WORD[inherited] }
    : { mode: 'PER_LINE', expected: ['Macho', 'Hembra'], codes: ['M = Macho', 'H = Hembra'] };

  const categoryNames = order.categories.map((c) => c.name ?? '…');
  let category: TroopField;

  if (order.needs_category_per_animal) {
    category = { mode: 'PER_LINE', expected: categoryNames, codes: order.categories.map((c) => `${c.position} = ${c.name ?? '…'}`) };
  } else if (order.categories.length <= 1) {
    category = { mode: 'GLOBAL', value: categoryNames[0] ?? 'Sin declarar' };
  } else {
    // Each sex admits one category: it follows from the sex, so it is said once per sex.
    const sexes: ('M' | 'H')[] = inherited ? [inherited] : ['M', 'H'];
    category = {
      mode: 'GLOBAL',
      value: sexes
        .map((s) => {
          const [line] = categoriesAdmitting(order.categories, s);

          return line ? `${s} = ${line.name ?? '…'}` : null;
        })
        .filter(Boolean)
        .join(' · ')
    };
  }

  const breed: TroopField =
    order.breeds.length > 1
      ? { mode: 'PER_LINE', expected: order.breeds.map((b) => b.label), codes: order.breeds.map((b) => `${b.letter} = ${b.label}`) }
      : { mode: 'GLOBAL', value: order.breeds[0]?.label || 'Sin declarar' };

  return { sex, category, breed };
};

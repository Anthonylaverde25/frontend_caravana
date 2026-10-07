import type { SexComposition } from './types';

/**
 * The categories of an entry order as the reception reads them: a received animal takes the only
 * category its sex admits, and declares its line (CAT, the category's number) only when its sex
 * admits several. The same rule the server applies (EntryTroop::needsCategoryPerAnimal).
 */
export interface CategoryLine {
  position: number;
  name: string | null;
  /** animal_categories.sex: a heifer category is H, a calf category BOTH. */
  sex: 'M' | 'H' | 'BOTH' | null;
}

export const admitsSex = (line: CategoryLine, sex: 'M' | 'H'): boolean => line.sex === 'BOTH' || line.sex === sex;

export const categoriesAdmitting = <T extends CategoryLine>(lines: T[], sex: 'M' | 'H'): T[] => lines.filter((line) => admitsSex(line, sex));

/** The sex every animal of the troop has, or null when each one declares it. */
export const inheritedSexOf = (composition: SexComposition | null | undefined): 'M' | 'H' | null =>
  composition === 'MALE' ? 'M' : composition === 'FEMALE' ? 'H' : null;

/** Some animal's sex admits more than one category: each line has to say which (the CAT column). */
export const needsCategoryPerAnimal = (lines: CategoryLine[], composition: SexComposition | null | undefined): boolean => {
  const inherited = inheritedSexOf(composition);
  const sexes: ('M' | 'H')[] = inherited ? [inherited] : ['M', 'H'];

  return sexes.some((sex) => categoriesAdmitting(lines, sex).length > 1);
};

/** "1 Novillito". */
export const categoryLabelOf = (line: CategoryLine): string => `${line.position} ${line.name ?? '…'}`;

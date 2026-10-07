import type { ArrivalFindingCode, EntryOrder, ReceivedAnimalPayload } from '@/features/entry-orders/types';
import { admitsSex, categoriesAdmitting, categoryLabelOf } from '@/features/entry-orders/categoryLines';
import { ING03_FINDING_FIELDS, type Ing03Row } from '../../../hooks/useIng03Pages';
import type { Ing03Layout } from '../../../templates/ing03/ing03Columns';

export const parseWeight = (raw: string): number | null | 'invalid' => {
  if (raw.trim() === '') return null;

  const value = Number(raw.replace(',', '.'));

  return Number.isFinite(value) && value > 0 ? value : 'invalid';
};

/** The official body condition scale: 1 to 5, in steps of 0.5. */
export const parseBodyCondition = (raw: string): number | null | 'invalid' => {
  if (raw.trim() === '') return null;

  const value = Number(raw.replace(',', '.'));

  return Number.isFinite(value) && value >= 1 && value <= 5 && Number.isInteger(value * 2) ? value : 'invalid';
};

/** On a sheet by code: "a", "A.", "Raza A" → "A". */
const letterOf = (raw: string): string => raw.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);

/** On a sheet by code: "2", "N° 2" → "2". */
const digitsOf = (raw: string): string => raw.replace(/\D/g, '');

/** The boxes marked on a line, as the codes the server takes. */
export const findingsOf = (row: Ing03Row): ArrivalFindingCode[] => ING03_FINDING_FIELDS.filter(([field]) => row[field] !== '').map(([, code]) => code);

/**
 * What is wrong with the category of a line, if anything. By code: a number the order does not
 * declare, one the animal's sex does not admit. Either way: none when its sex admits several. A
 * name written in words is resolved by the server when the reception is registered.
 */
const categoryProblemOf = (order: EntryOrder, cat: string, written: boolean, sex: 'M' | 'H' | null): string | null => {
  const sexWord = sex === 'M' ? 'machos' : 'hembras';

  if (cat !== '' && written) return null;

  if (cat !== '') {
    const line = order.categories.find((c) => c.position === Number(cat));

    if (!line) return `La orden no tiene la categoría ${cat}: son ${order.categories.map(categoryLabelOf).join(', ')}.`;

    return sex && !admitsSex(line, sex) ? `La categoría ${line.name} no admite ${sexWord}.` : null;
  }

  if (!sex) return null;

  const candidates = categoriesAdmitting(order.categories, sex);

  if (candidates.length === 0) return `Ninguna categoría de la orden admite ${sexWord}.`;

  if (candidates.length <= 1) return null;

  return written
    ? `Falta la categoría: ${candidates.map((c) => c.name).join(' o ')}.`
    : `Falta la categoría (Cat.): ${candidates.map(categoryLabelOf).join(', ')}.`;
};

/**
 * What the sheet says about one line's sex, category and breed: an error that blocks it, a warning
 * to check, and the part of the animal it sends — by position on a sheet by code, as written on a
 * sheet in words.
 */
export const lineReferencesOf = (
  order: EntryOrder,
  layout: Ing03Layout,
  row: Ing03Row,
  inheritedSex: 'M' | 'H' | null
): { error: string | null; warning: string | null; animal: Pick<ReceivedAnimalPayload, 'sex' | 'breed_position' | 'category_position' | 'breed_text' | 'color_text' | 'category_text'> } => {
  const { mixed, needsCategory, severalBreeds, written } = layout;
  const cat = written ? row.cat.trim() : digitsOf(row.cat);
  const letter = letterOf(row.raza);
  const position = order.breeds.find((b) => b.letter === letter)?.position ?? null;
  const breedWritten = row.raza.trim() !== '' || row.pelaje.trim() !== '';
  const animal = {
    sex: mixed ? (row.sexo as 'M' | 'H') : null,
    breed_position: !written && severalBreeds && letter ? position : null,
    category_position: !written && needsCategory && cat !== '' ? Number(cat) : null,
    ...(written && severalBreeds && breedWritten ? { breed_text: row.raza.trim() || null, color_text: row.pelaje.trim() || null } : {}),
    ...(written && needsCategory && cat !== '' ? { category_text: cat } : {})
  };

  if (mixed && row.sexo !== 'M' && row.sexo !== 'H') {
    return { error: row.sexo ? `"${row.sexo}" no es un sexo: M o H.` : 'La tropa es de ambos sexos: falta el sexo (M o H).', warning: null, animal };
  }

  const categoryError = needsCategory ? categoryProblemOf(order, cat, written, mixed ? (row.sexo as 'M' | 'H') : inheritedSex) : null;

  if (categoryError) return { error: categoryError, warning: null, animal };

  if (!written && severalBreeds && letter !== '' && position === null) {
    return { error: `La orden no tiene la raza "${letter}": las letras son ${order.breeds.map((b) => b.letter).join(', ')}.`, warning: null, animal };
  }

  const warning =
    severalBreeds && !breedWritten ? `Sin raza: queda sin declarar. ${written ? 'Escribí la raza y el pelaje' : 'Escribí la letra'} si se sabe.` : null;

  return { error: null, warning, animal };
};

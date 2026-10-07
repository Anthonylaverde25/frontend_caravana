import type { EntryOrder, EntryOrderReceiptSheet } from '@/features/entry-orders/types';
import { troopDefaultsOf } from '@/features/entry-orders/troopDefaults';

export type Ing03ColumnKey = 'n' | 'caravana' | 'sexo' | 'cat' | 'raza' | 'pelaje' | 'ec' | 'peso' | 'ojo' | 'oreja' | 'aplomo';

export interface Ing03Column {
  key: Ing03ColumnKey;
  label: string;
  /** Share of the grid, in percent. The caravan has none: it takes the rest. */
  width?: number;
  center?: boolean;
  /** A box to mark with an X, printed empty. */
  box?: boolean;
}

/** The three boxes of what the animal came off the truck with, under one heading. */
export const ING03_FINDING_KEYS: Ing03ColumnKey[] = ['ojo', 'oreja', 'aplomo'];

/** Usable width of an A4 page with the sheet's margins, in mm. */
const PRINTABLE_MM = { portrait: 192, landscape: 281 } as const;

/** What a handwritten caravan of about fifteen characters needs, in mm. */
const CARAVAN_MIN_MM = 55;

/**
 * What the order leaves to each line — the sex on a troop of both sexes, the category when a sex
 * admits several of the order's, the breed on one of several — and how the sheet asks for it.
 */
export const ing03LayoutOf = (
  order: Pick<EntryOrder, 'sex_composition' | 'breeds' | 'needs_category_per_animal'>,
  sheet: Pick<EntryOrderReceiptSheet, 'weighing_mode' | 'reference_mode'>
) => ({
  mixed: order.sex_composition === 'MIXED',
  needsCategory: order.needs_category_per_animal,
  severalBreeds: order.breeds.length > 1,
  averaged: sheet.weighing_mode === 'AVERAGE',
  written: sheet.reference_mode !== 'CODE'
});

export type Ing03Layout = ReturnType<typeof ing03LayoutOf>;

/**
 * The grid of the sheet, the same in both orientations: one blank line per animal that arrives,
 * where the chute writes its caravan, the body condition, the weight on a sheet weighed per animal,
 * and marks the boxes of an injured eye, ear or limb. Sex, category and breed only get a column
 * when the order leaves them to each animal — category and breed written in words (with the coat
 * in its own column) or by the header's number and letter. Whatever the order fixes is printed
 * once, in the TROPA band.
 */
export const ing03ColumnsOf = ({ mixed, needsCategory, severalBreeds, averaged, written }: Ing03Layout): Ing03Column[] => [
  { key: 'n', label: '#', width: 5, center: true },
  // The caravan takes whatever the other columns leave.
  { key: 'caravana', label: 'Caravana' },
  ...(mixed ? [{ key: 'sexo' as const, label: 'Sexo', width: 6, center: true }] : []),
  ...(needsCategory ? [{ key: 'cat' as const, label: written ? 'Categoría' : 'Cat.', width: written ? 12 : 6, center: !written }] : []),
  ...(severalBreeds
    ? written
      ? [
          { key: 'raza' as const, label: 'Raza', width: 12 },
          { key: 'pelaje' as const, label: 'Pelaje', width: 10 }
        ]
      : [{ key: 'raza' as const, label: 'Raza', width: 6, center: true }]
    : []),
  { key: 'ec', label: 'EC', width: 6, center: true },
  ...(averaged ? [] : [{ key: 'peso' as const, label: 'Peso (kg)', width: 11 }]),
  { key: 'ojo', label: 'Ojo', width: 5, center: true, box: true },
  { key: 'oreja', label: 'Oreja', width: 6, center: true, box: true },
  { key: 'aplomo', label: 'Aplomo', width: 7, center: true, box: true }
];

/** Share of the grid left to the caravan, in percent. */
export const ing03CaravanShare = (columns: Ing03Column[]): number => 100 - columns.reduce((sum, column) => sum + (column.width ?? 0), 0);

/**
 * Whether the caravan still has room for a handwritten tag on a portrait page. When it does not —
 * breed, coat and category written in words on top of every other column — the sheet goes out in
 * landscape only.
 */
export const ing03FitsPortrait = (columns: Ing03Column[]): boolean => (ing03CaravanShare(columns) / 100) * PRINTABLE_MM.portrait >= CARAVAN_MIN_MM;

/** The strip of instructions above the grid. */
export const ing03InstructionsOf = ({ mixed, needsCategory, severalBreeds, averaged, written }: Ing03Layout): string =>
  [
    'UN RENGLÓN POR ANIMAL QUE LLEGA: escribir su CARAVANA',
    'Renglón vacío = todavía no llegó',
    mixed ? 'Sexo: M o H' : null,
    needsCategory ? (written ? 'Categoría: escribir el nombre' : 'Cat.: el número de la referencia de TROPA') : null,
    severalBreeds ? (written ? 'Raza y pelaje: escribir lo que se ve (ej. BRAFORD · COLORADO)' : 'Raza: la letra de la referencia de TROPA') : null,
    'EC: estado corporal de 1 a 5, de 0,5 en 0,5 (opcional)',
    averaged ? 'Peso: un único PESO PROMEDIO arriba, para todas las que llegan' : 'Peso opcional',
    'OJO / OREJA / APLOMO: marcar X si llega con lesión (renguera o golpe en patas = APLOMO)',
    'Renglones grises: libres, para animales de más'
  ]
    .filter(Boolean)
    .join(' • ');

/**
 * The TROPA band of the header: each datum once when the order fixes it, or what each line can
 * say — the expected breeds and categories, or their letters and numbers on a sheet by code.
 */
export const ing03TroopBandOf = (
  order: Pick<EntryOrder, 'sex_composition' | 'sex_composition_label' | 'breeds' | 'categories' | 'needs_category_per_animal'>,
  written: boolean
): { label: string; value: string; perLine: boolean }[] => {
  const defaults = troopDefaultsOf(order);
  const cell = (label: string, field: (typeof defaults)['sex'], column: string) =>
    field.mode === 'GLOBAL'
      ? { label, value: field.value, perLine: false }
      : { label, value: `Por renglón (${column}) — ${(written ? field.expected : field.codes).join(' · ')}`, perLine: true };

  return [
    cell('Sexo', defaults.sex, 'SEXO'),
    cell('Categoría', defaults.category, written ? 'CATEGORÍA' : 'CAT.'),
    cell('Raza / pelaje', defaults.breed, written ? 'RAZA y PELAJE' : 'RAZA')
  ];
};

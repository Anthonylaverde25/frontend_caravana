import type { Supplier } from '@/core/suppliers/domain/entities/Supplier';
import type { Farm } from '@/core/suppliers/domain/entities/Farm';
import type { AnimalCategory } from '@/core/categories/domain/entities/AnimalCategory';
import type { Breed } from '@/core/breeds/domain/entities/Breed';
import { emptyExternalBatchForm, ExternalBatchFormInput } from '@/ui/batches/components/external/externalBatchSchema';

/** Category lines of the ING-02: the blank sheet prints this many, read as categoria_N / cabezas_N. */
export const ING02_CATEGORY_LINES = 4;

/** What the reading of an ING-02 says: the header cells and one row per breed line, as text. */
export interface Ing02ScanReading {
  context: Record<string, unknown>;
  rows: Record<string, unknown>[];
}

/** A cell the reading could not turn into a form value, to mark in the review. */
export interface Ing02ScanNote {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface Ing02Catalogs {
  suppliers: Supplier[];
  farms: Farm[];
  categories: AnimalCategory[];
  breeds: Breed[];
}

const cell = (value: unknown): string => {
  const raw = value && typeof value === 'object' && 'value' in (value as object) ? (value as { value: unknown }).value : value;

  return raw == null ? '' : String(raw).trim();
};

const norm = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();

const digits = (value: string): string => value.replace(/\D/g, '');

const numberOf = (value: string): number | null => {
  const clean = value.replace(',', '.').replace(/[^\d.]/g, '');

  return clean === '' || Number.isNaN(Number(clean)) ? null : Number(clean);
};

/** "☒ MACHOS", "AMBOS", "machos, hembras": the marked options of a box group. */
const marked = (value: string, options: Record<string, string>): string[] =>
  Object.keys(options).filter((word) => norm(value).split(/[,;/]/).some((part) => norm(part).includes(word)));

const dateOf = (value: string): string | null => {
  const dmy = value.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/);

  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
};

/**
 * Turns the reading of a hand-filled ING-02 into the "Alta de Lote Externo" form, so the person
 * reviews it in the same dialog where any purchase is declared, and confirms. Names are matched
 * against the catalogues; what does not match exactly is left blank or flagged, never guessed —
 * a provider is chosen by its CUIT first, then by an exact name, and a fuzzy name is only a hint.
 */
export function ing02ScanToForm(reading: Ing02ScanReading, catalogs: Ing02Catalogs): { values: ExternalBatchFormInput; notes: Ing02ScanNote[] } {
  const c = (key: string) => cell(reading.context[key]);
  const values = emptyExternalBatchForm();
  const notes: Ing02ScanNote[] = [];
  const note = (field: string, severity: Ing02ScanNote['severity'], message: string) => notes.push({ field, severity, message });

  // Provider: CUIT, then exact name; an approximate name is only advised.
  const cuit = digits(c('cuit_proveedor'));
  const providerName = c('proveedor');
  const provider =
    (cuit.length >= 8 ? catalogs.suppliers.find((s) => digits(s.cuit) === cuit) : undefined) ??
    catalogs.suppliers.find((s) => norm(s.name) === norm(providerName));

  if (provider) {
    values.provider_id = provider.id;
  } else {
    const similar = catalogs.suppliers.find((s) => providerName !== '' && norm(s.name).includes(norm(providerName)));

    note(
      'provider_id',
      'warning',
      similar
        ? `La hoja dice "${providerName}": ¿es ${similar.name}? Elegilo en el formulario.`
        : `No hay un proveedor "${providerName || '(vacío)'}"${cuit ? ` con CUIT ${c('cuit_proveedor')}` : ''}. Elegilo o crealo.`
    );
  }

  const farmName = c('establecimiento');
  const farm = provider ? catalogs.farms.find((f) => f.provider_id === provider.id && norm(f.name) === norm(farmName)) : undefined;

  if (farm) values.farm_id = farm.id;
  else note('farm_id', 'warning', `Establecimiento "${farmName || '(vacío)'}" sin identificar: elegilo en el formulario.`);

  // The sheet carries no auction termination, so there is no name to suggest: it is the one written.
  values.batch_name_mode = 'CUSTOM';
  values.batch_name = c('nombre_lote');
  if (values.batch_name === '') note('batch_name', 'error', 'La hoja no tiene el nombre del lote externo: escribilo en el formulario.');

  const purchase = dateOf(c('fecha_compra'));
  if (purchase) values.purchase_date = purchase;
  else note('purchase_date', 'warning', `No se entiende la fecha de compra "${c('fecha_compra')}".`);

  // The CATEGORÍAS grid: one line per category bought, with its head. A blank line is not one.
  const categoryLines = Array.from({ length: ING02_CATEGORY_LINES }, (_, i) => ({ name: c(`categoria_${i + 1}`), head: c(`cabezas_${i + 1}`) })).filter(
    (line) => line.name !== '' || line.head !== ''
  );
  const chosen = categoryLines.map((line, index) => {
    const category = catalogs.categories.find((cat) => norm(cat.name) === norm(line.name) || norm(cat.code) === norm(line.name));
    const head = numberOf(line.head);

    if (!category) note(`categories.${index}`, 'error', `Categoría "${line.name || '(vacía)'}" desconocida.`);
    if (head == null) note(`categories.${index}`, 'error', `${category?.name ?? `La categoría ${index + 1}`} no tiene cabezas escritas.`);

    return { category, head };
  });

  values.categories = chosen.map(({ category, head }) => ({ category_id: category?.id ?? null, head_count: head }));
  if (values.categories.length === 0) {
    values.categories = [{ category_id: null, head_count: null }];
    note('categories', 'error', 'La tabla de categorías está vacía.');
  }

  const sexes = marked(c('sexo'), { MACHOS: 'MALE', HEMBRAS: 'FEMALE', AMBOS: 'MIXED' });
  if (sexes.length === 1) {
    values.sex_composition = ({ MACHOS: 'MALE', HEMBRAS: 'FEMALE', AMBOS: 'MIXED' } as const)[sexes[0] as 'MACHOS'];
  } else {
    note('sex_composition', 'error', sexes.length === 0 ? 'No hay sexo marcado.' : `Hay más de un sexo marcado (${sexes.join(', ')}).`);
  }

  values.male_count = numberOf(c('machos'));
  values.female_count = numberOf(c('hembras'));

  const conditions = marked(c('estado'), { 'MUY BUENO': 'VERY_GOOD', EXCELENTE: 'EXCELLENT', REGULAR: 'REGULAR', BUENO: 'GOOD' });
  const condition = conditions.includes('MUY BUENO') ? 'MUY BUENO' : conditions.length === 1 ? conditions[0] : null;
  if (condition) values.condition = ({ 'MUY BUENO': 'VERY_GOOD', EXCELENTE: 'EXCELLENT', REGULAR: 'REGULAR', BUENO: 'GOOD' } as const)[condition as 'BUENO'];
  else note('condition', 'error', 'El estado no está marcado, o hay más de uno.');

  const age = c('edad').match(/^(\d{1,3})\s*\/\s*(\d{1,3})$/);
  if (age) {
    values.age_min_months = Number(age[1]);
    values.age_max_months = Number(age[2]);
  } else if (c('edad') !== '') {
    note('age_min_months', 'warning', `No se entiende la edad "${c('edad')}": se espera desde/hasta, ej. 9/10.`);
  }

  const yesNo = (key: string): boolean | undefined => {
    const options = marked(c(key), { SI: 'yes', NO: 'no' });

    return options.length === 1 ? options[0] === 'SI' : undefined;
  };
  values.knows_to_eat = yesNo('sabe_comer') as boolean;
  values.tick_vaccinated = yesNo('garrapata') as boolean;
  if (values.knows_to_eat === undefined) note('knows_to_eat', 'error', '"Sabe comer" no está marcado como SÍ o NO.');
  if (values.tick_vaccinated === undefined) note('tick_vaccinated', 'error', '"Garrapata" no está marcado como SÍ o NO.');

  values.estimated_weight = numberOf(c('peso_aprox')) ?? undefined;
  values.min_weight = numberOf(c('peso_min'));
  values.max_weight = numberOf(c('peso_max'));
  values.shrink_percent = numberOf(c('desbaste'));
  values.observations = c('observaciones');

  const lines = reading.rows
    .map((row) => ({ breed: cell(row.raza), color: cell(row.pelaje) }))
    .filter((line) => line.breed !== '');

  values.breeds = lines.map((line, index) => {
    const breed = catalogs.breeds.find((b) => norm(b.name) === norm(line.breed));
    const color = breed?.colors?.find((col) => norm(col.name) === norm(line.color));

    if (!breed) note(`breeds.${index}`, 'error', `Raza "${line.breed}" desconocida.`);
    else if (line.color !== '' && !color) note(`breeds.${index}`, 'error', `"${line.color}" no es un pelaje de ${breed.name}.`);

    return { breed_id: breed?.id ?? null, color_id: color?.id ?? null };
  });

  // Contradictions the form would otherwise fix or reject without saying what the paper said.
  if (values.sex_composition && values.sex_composition !== 'MIXED') {
    const other = values.sex_composition === 'MALE' ? 'H' : 'M';
    const wrong = chosen.find(({ category }) => category?.sex === other);

    if (wrong?.category) {
      note(
        'sex_composition',
        'error',
        `La hoja dice ${wrong.category.name} y marca ${sexes.join(', ')}: ${wrong.category.name} es sólo de ${other === 'H' ? 'hembras' : 'machos'}.`
      );
    }
  }

  const head = chosen.every(({ head: h }) => h != null) && chosen.length > 0 ? chosen.reduce((sum, { head: h }) => sum + (h ?? 0), 0) : null;
  const males = numberOf(c('machos'));
  const females = numberOf(c('hembras'));

  if (values.sex_composition === 'MIXED' && head != null && males != null && females != null && males + females !== head) {
    note('male_count', 'error', `Machos (${males}) y hembras (${females}) no suman las ${head} cabezas.`);
  }

  if (age && Number(age[1]) > Number(age[2])) {
    note('age_max_months', 'error', `La edad "${c('edad')}" está invertida: desde no puede ser mayor que hasta.`);
  }

  if (values.breeds.length === 0) {
    values.breeds = [{ breed_id: null, color_id: null }];
    note('breeds', 'error', 'La tabla de razas está vacía.');
  }

  return { values, notes };
}

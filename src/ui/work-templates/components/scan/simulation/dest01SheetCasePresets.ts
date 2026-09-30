import { SimulationPreset } from './types';

/**
 * One preset per test sheet in `ai-agent/image_test/dest001/dest01_08..25_*`, carrying the same
 * data as the image, so each case can be driven through the screen without calling Gemini.
 *
 * They run against WeaningTestCalvesSeeder (DST-T-01..46 at foot in "Lote Testing Cría
 * (destete)", DST-T-47 weaned into "Destete Septiembre 2026", DST-T-48 at foot in "Lote Testing
 * Cría (otro rodeo)", DST-T-49..70 for the order sheets and the issued orders DS-20260915-0001..3).
 * Reseed between loads that wean:
 *     php artisan tenants:seed --class=WeaningTestCalvesSeeder
 *
 * Sheets 16, 17 and 26 have no preset on purpose: they only degrade the photo, and a simulation
 * skips the reading that is being tested. Sheet 27 is the blank print.
 */

const SHEET_DATE = '2026-09-22';
const REQUIRES = ' Requiere WeaningTestCalvesSeeder.';

interface WeaningRow {
  id: string;
  caravana: string;
  caravana_madre: string;
  peso: string;
  sexo: string;
  observations: string;
  cs_nueva?: string;
  lote_destino?: string;
  manejo?: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** A calf of the seeder, with its own mother unless told otherwise. */
const calf = (n: number, peso: string, overrides: Partial<WeaningRow> = {}): WeaningRow => ({
  id: String(n),
  caravana: `DST-T-${pad(n)}`,
  caravana_madre: `DST-V-${pad(n)}`,
  peso,
  sexo: n % 3 === 0 ? 'H' : 'M',
  observations: '',
  ...overrides,
});

const four = [1, 2, 3, 4].map((n) => calf(n, String(165 + 3 * n)));

const header = (overrides: Record<string, unknown>): Record<string, unknown> => ({
  orden_destete: '',
  // New weaning batches declare their management system; the box of the header answers it.
  sistema_manejo: 'PASTURA',
  fecha_destete: SHEET_DATE,
  tipo_destete: 'TRADICIONAL',
  lote_origen: 'Lote Testing Cría (destete)',
  responsable: 'Anthony Laverde',
  hoja_numero: 1,
  hoja_total: 1,
  ...overrides,
});

const sheetCase = (label: string, description: string, rows: WeaningRow[], context: Record<string, unknown>): SimulationPreset => ({
  templateCode: 'DEST-01',
  scenario: 'SHEET_CASES',
  scenarioLabel: label,
  scenarioDescription: description + REQUIRES,
  templateTitle: 'Destete y Conformación de Lote de Destete',
  category: 'WEANING',
  context,
  rows,
});

/** Some day always ahead of today, so case 09 keeps being a future date. */
const futureDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 90);

  return date.toISOString().slice(0, 10);
};


const ORDER_DATE = '2026-09-22';
const SINGLE_ORDER = 'DS-20260915-0001';
const PER_ANIMAL_ORDER = 'DS-20260915-0002';
const AT_CHUTE_ORDER = 'DS-20260915-0003';
const EXISTING = 'Destete Septiembre 2026';
const NEW_MALES = 'Destete Machos Prueba 2026';

/** The calves of DS-20260915-0001: DST-T-49..56 and, from the other rodeo, 67 and 68. */
const singleOrderCalves = [49, 50, 51, 52, 53, 54, 55, 56, 67, 68];

/** An order sheet: the header comes from the order, printed; only the weights are handwritten. */
const orderHeader = (code: string, overrides: Record<string, unknown> = {}): Record<string, unknown> =>
  header({ orden_destete: code, lote_destete: EXISTING, sistema_manejo: '', fecha_destete: ORDER_DATE, lote_origen: 'Varios (ver crías)', ...overrides });

/** Per animal: the batch of each calf on its row, as DS-20260915-0002 prints it. */
const perAnimalOrderRow = (n: number, peso: string): WeaningRow =>
  n % 3 === 0
    ? calf(n, peso, { lote_destino: EXISTING, manejo: 'C', cs_nueva: 'Vaquillona / Reposición' })
    : calf(n, peso, { lote_destino: NEW_MALES, manejo: 'P', cs_nueva: 'Novillito' });

export const DEST01_SHEET_CASES: SimulationPreset[] = [
  sheetCase(
    '08 · Destete anterior al nacimiento',
    'Fechada el 01/01/2026; las crías nacieron el 10/02/2026. Se espera WEANING_BEFORE_BIRTH en cada fila.',
    four,
    header({ lote_destete: 'Destete Prueba Fechas 2026', fecha_destete: '2026-01-01' })
  ),
  sheetCase(
    '09 · Fecha futura',
    'Fechada 90 días adelante. Se espera FUTURE_DATE.',
    four,
    header({ lote_destete: 'Destete Prueba Fechas 2026', fecha_destete: futureDate() })
  ),
  sheetCase(
    '10 · Válida hacia el lote existente',
    'DST-T-11..16 hacia "Destete Septiembre 2026", que ya existe y tiene a DST-T-47. Carga limpia.',
    [11, 12, 13, 14, 15, 16].map((n) => calf(n, String(160 + 2 * n))),
    header({ lote_destete: 'Destete Septiembre 2026' })
  ),
  sheetCase(
    '11 · Lote de destino que no es de destete',
    'El lote escrito es el propio lote de cría. Se espera un rechazo: no es un lote de destete, ni se puede crear con ese nombre.',
    four,
    header({ lote_destete: 'Lote Testing Cría (destete)' })
  ),
  sheetCase(
    '12 · Madre equivocada',
    'DST-T-22 con la madre DST-V-23 y DST-T-24 con DST-V-21. Hoy la madre no se controla (decisión D1).',
    [
      calf(21, '171'),
      calf(22, '183', { caravana_madre: 'DST-V-23', observations: 'madre cruzada' }),
      calf(23, '165'),
      calf(24, '190', { caravana_madre: 'DST-V-21', observations: 'madre cruzada' }),
      calf(25, '178'),
      calf(26, '162'),
    ],
    header({ lote_destete: 'Destete Prueba Madres 2026' })
  ),
  sheetCase(
    '13 · Pesos anómalos',
    'Peso 0, 1850 (un dígito de más) y "185,5" con coma. El 0 bloquea hasta corregirlo o vaciarlo; el 1850 queda marcado en ámbar contra la mediana de la tropa y, si se confirma, se registra como aviso WEIGHT_OUTLIER.',
    [
      calf(31, '0', { observations: 'peso cero' }),
      calf(32, '1850', { observations: 'un digito de mas' }),
      calf(33, '185,5', { observations: 'con coma' }),
      calf(34, '172'),
    ],
    header({ lote_destete: 'Destete Prueba Pesos 2026' })
  ),
  sheetCase(
    '14 · Cría de otro rodeo',
    'DST-T-48 está al pie, pero en "Lote Testing Cría (otro rodeo)" y la planilla declara el otro lote. Hoy se desteta igual (decisión D3).',
    [calf(1, '168'), calf(2, '171'), calf(48, '175', { observations: 'de otro rodeo' })],
    header({ lote_destete: 'Destete Prueba Otro Rodeo 2026' })
  ),
  sheetCase(
    '15 · Tipo de destete ambiguo',
    'Dos tipos marcados (ANTICIPADO y PRECOZ). Se observa qué queda registrado.',
    [5, 6, 7, 8].map((n) => calf(n, String(165 + 3 * n))),
    header({ lote_destete: 'Destete Prueba Tipo 2026', tipo_destete: 'ANTICIPADO, PRECOZ' })
  ),
  sheetCase(
    '18 · Orden completa',
    `Cumple ${SINGLE_ORDER}: sus 10 crías (dos del otro rodeo) hacia "${EXISTING}", todas pesadas. Se espera la orden EJECUTADA.`,
    singleOrderCalves.map((n) => calf(n, String(158 + (n % 7) * 4))),
    orderHeader(SINGLE_ORDER)
  ),
  sheetCase(
    '19 · Orden parcial',
    `Cumple ${SINGLE_ORDER} con 6 de sus 10 crías. Se espera PARCIAL, con aviso WEANING_ORDER_PARTIAL; faltan DST-T-55, 56, 67 y 68.`,
    [49, 50, 51, 52, 53, 54].map((n) => calf(n, String(158 + (n % 7) * 4))),
    orderHeader(SINGLE_ORDER)
  ),
  sheetCase(
    '20 · Código de orden con letra O',
    `El código se leyó "DS-2O26O915-OOO1": el resolver cambia las O por ceros y encuentra ${SINGLE_ORDER}.`,
    singleOrderCalves.map((n) => calf(n, String(158 + (n % 7) * 4))),
    orderHeader('DS-2O26O915-OOO1')
  ),
  sheetCase(
    '21 · Orden inexistente',
    'El código DS-20260915-0099 no existe. Se espera WEANING_ORDER_NOT_FOUND hasta corregirlo o borrarlo; no se crea ninguna orden.',
    [49, 50, 51].map((n) => calf(n, '170')),
    orderHeader('DS-20260915-0099')
  ),
  sheetCase(
    '22 · Orden por animal con C/S declarada',
    `Cumple ${PER_ANIMAL_ORDER}: machos a "${NEW_MALES}" (pastura, se crea) como Novillito; hembras a "${EXISTING}" como Vaquillona / Reposición.`,
    [57, 58, 59, 60, 61, 62].map((n) => perAnimalOrderRow(n, String(160 + (n % 5) * 6))),
    orderHeader(PER_ANIMAL_ORDER, { lote_destete: '— por animal —' })
  ),
  sheetCase(
    '23 · Orden con C/S decidida en la manga',
    `Cumple ${AT_CHUTE_ORDER} (categoría en la manga): machos "Novillito", DST-T-63 "Vaq / Reposición", DST-T-66 y 69 en blanco (no cambian). Tipo marcado: ANTICIPADO.`,
    [
      calf(63, '165', { cs_nueva: 'Vaq / Reposición' }),
      calf(64, '181', { cs_nueva: 'Novillito' }),
      calf(65, '176', { cs_nueva: 'Novillito' }),
      calf(66, '158'),
      calf(69, '162'),
      calf(70, '184', { cs_nueva: 'Novillito' }),
    ],
    orderHeader(AT_CHUTE_ORDER, { tipo_destete: 'ANTICIPADO' })
  ),
  sheetCase(
    '24 · En blanco, lote por cría',
    'Sin orden, destino por animal escrito a mano: DST-T-37..40 a "Destete Por Animal Prueba 2026" (P, se crea) y 41..42 a "Destete Septiembre 2026". Se crea una orden REGISTRADA.',
    [
      ...[37, 38, 39, 40].map((n) => calf(n, String(166 + n % 4 * 5), { lote_destino: 'Destete Por Animal Prueba 2026', manejo: 'P' })),
      ...[41, 42].map((n) => calf(n, String(170 + n % 3 * 4), { lote_destino: EXISTING, manejo: 'C' })),
    ],
    header({ lote_destete: '— por animal —', sistema_manejo: '' })
  ),
  sheetCase(
    '25 · Lote por cría con una fila sin lote',
    'Como la 24, pero DST-T-40 quedó sin lote: es una cría sin destino (no se completa con el encabezado). Se espera DESTINATION_MISSING en su fila.',
    [
      ...[37, 38, 39].map((n) => calf(n, String(166 + n % 4 * 5), { lote_destino: 'Destete Por Animal Prueba 2026', manejo: 'P' })),
      calf(40, '171', { observations: 'sin lote' }),
      ...[41, 42].map((n) => calf(n, String(170 + n % 3 * 4), { lote_destino: EXISTING, manejo: 'C' })),
    ],
    header({ lote_destete: '— por animal —', sistema_manejo: '' })
  ),
];

import { SimulationPreset } from './types';

/**
 * One preset per test sheet in `ai-agent/image_test/cact001/cact01_18..29_*`, carrying the same
 * data as the image, so each case can be driven through the screen without calling Gemini.
 *
 * Cases 39 to 42 have no image: they drive what the screen fills in from the animals read.
 *
 * They run against Cact01ActivityChangeScanTestSeeder (GRO-001-CAR-001..026 in "Test CACT Cría"
 * and the ISSUED order TR-20260615-0001, 017..024 to "Test CACT Recría"). Reseed between loads
 * that move animals:
 *     php artisan tenants:seed --class=Cact01ActivityChangeScanTestSeeder
 *
 * Sheets 30 and 31 have no preset on purpose: they only degrade the photo, and a simulation
 * skips the reading that is being tested.
 */

const ORDER_CODE = 'TR-20260615-0001';
/** 007..010, category decided at the chute (AT_CHUTE). */
const AT_CHUTE_ORDER_CODE = 'TR-20260615-0002';
/** 011..016, category declared at the desk (DECLARED): males Novillito, females Vaquillona / Reposición. */
const DECLARED_ORDER_CODE = 'TR-20260615-0003';
/** 001..006, destination per animal and category both decided at the chute. */
const PER_ANIMAL_AT_CHUTE_ORDER_CODE = 'TR-20260615-0004';
const SOURCE = 'Test CACT Cría';
const PASTURE = 'Test CACT Recría';
const PENNED = 'Test CACT Recría Corral';
const SHEET_DATE = '2026-09-22';
const REQUIRES = ' Requiere Cact01ActivityChangeScanTestSeeder.';

interface SheetRow {
  id: string;
  caravana: string;
  peso_actual: string;
  sexo: string;
  categoria: string;
  dientes: string;
  lote_destino: string;
  /** The M cell of a per-animal sheet. */
  manejo?: string;
  /** The C/S nueva cell. Absent on sheets whose order does not change the category. */
  cs_nueva?: string;
  observations: string;
}

/** An animal as the seeder leaves it, with the weight printed on the sheet (base + 46 kg). */
const animal = (n: number, overrides: Partial<SheetRow> = {}): SheetRow => ({
  id: String(n),
  caravana: `GRO-001-CAR-${String(n).padStart(3, '0')}`,
  peso_actual: `${250 + 4 * n}.0`,
  sexo: n % 3 === 0 ? 'H' : 'M',
  categoria: 'Ternero',
  dientes: n <= 16 ? 'DL' : '2D',
  lote_destino: '',
  observations: '',
  ...overrides,
});

const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const totals = (rows: SheetRow[]) => ({
  total_cabezas: rows.length,
  peso_total: rows.reduce((sum, r) => sum + (parseFloat(r.peso_actual) || 0), 0),
});

const header = (rows: SheetRow[], overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  actividad_origen: 'Cría',
  actividad_destino: 'Recría',
  lote_origen: SOURCE,
  lote_destino: PASTURE,
  fecha_movimiento: SHEET_DATE,
  sistema_manejo: 'PASTURA',
  responsable: 'Encargado de manga',
  hoja_numero: 1,
  hoja_total: 1,
  ...totals(rows),
  ...overrides,
});

const sheetCase = (
  label: string,
  description: string,
  rows: SheetRow[],
  context: Record<string, unknown>
): SimulationPreset => ({
  templateCode: 'CACT-01',
  scenario: 'SHEET_CASES',
  scenarioLabel: label,
  scenarioDescription: description + REQUIRES,
  templateTitle: 'Cambio de Actividad de Hacienda',
  category: 'ACTIVITY',
  context,
  rows,
});

/** Some day always ahead of today, so case 27 keeps being a future date. */
const futureDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 90);

  return date.toISOString().slice(0, 10);
};

const orderRows = range(17, 24).map((n) => animal(n));

const twoPageOrder = (): SimulationPreset => {
  const metadata = (page: number) => ({
    ...header(orderRows, { orden_transferencia: ORDER_CODE }),
    total_cabezas: String(orderRows.length),
    peso_total: String(totals(orderRows).peso_total),
    hoja_numero: page,
    hoja_total: 2,
  });
  const pageRows = (rows: SheetRow[], pageKey: string) => rows.map((r) => ({ ...r, pageKey }));

  return {
    ...sheetCase(
      '22+23 · Orden en dos hojas (4 + 4)',
      'La orden completa repartida en dos hojas con el mismo encabezado: se unen en una sola carga y la orden queda EJECUTADA.',
      orderRows,
      { ...header(orderRows, { orden_transferencia: ORDER_CODE }), hoja_total: 2 }
    ),
    pages: [
      {
        key: 'page-1',
        fileName: 'cact01_22_orden_dos_hojas_hoja_1_de_2.svg',
        hojaNumero: 1,
        hojaTotal: 2,
        metadata: metadata(1),
        rows: pageRows(orderRows.slice(0, 4), 'page-1'),
      },
      {
        key: 'page-2',
        fileName: 'cact01_23_orden_dos_hojas_hoja_2_de_2.svg',
        hojaNumero: 2,
        hojaTotal: 2,
        metadata: metadata(2),
        rows: pageRows(orderRows.slice(4), 'page-2'),
      },
    ],
  };
};

const cact20Rows: SheetRow[] = range(11, 14).map((n) => ({
  id: String(n),
  caravana: `CAC-A-${String(n).padStart(2, '0')}`,
  peso_actual: `${236 + 2 * n}.0`,
  sexo: n % 3 === 0 ? 'H' : 'M',
  categoria: 'Ternero',
  dientes: 'DL',
  lote_destino: '',
  observations: '',
}));

const rows25 = [
  animal(3, { sexo: 'M', observations: 'Sexo corregido a mano' }),
  animal(4, { categoria: 'Novillo', observations: 'Categoria a mano' }),
  animal(5),
  animal(25, { dientes: '2D', observations: 'Denticion a mano' }),
];

const rows26 = range(1, 6).map((n) => animal(n));
const rows27 = range(1, 4).map((n) => animal(n));
const rows41 = [
  ...range(1, 4).map((n) => animal(n, { sexo: '', categoria: '' })),
  animal(5, { sexo: 'H', categoria: '' }),
];
const rows42 = [
  animal(1, { lote_destino: PASTURE, manejo: 'P' }),
  animal(2, { lote_destino: PASTURE, manejo: 'P' }),
  animal(3, { lote_destino: PENNED, manejo: 'C' }),
  animal(4),
  animal(5),
];
const rows29 = [animal(1), animal(2), animal(26, { peso_actual: '300.0', observations: 'Se peso de nuevo el 15/09' })];

// The declared order prints its targets; 013 was overwritten at the chute and 016 read blank.
const declaredTarget = (n: number): string => (n % 3 === 0 ? 'Vaquillona / Reposición' : 'Novillito');
const rows34 = range(11, 16).map((n) =>
  animal(n, {
    cs_nueva: n === 13 ? 'Torito' : n === 16 ? '' : declaredTarget(n),
    observations: n === 13 ? 'Queda entero' : '',
  })
);

export const CACT01_SHEET_CASES: SimulationPreset[] = [
  sheetCase(
    '32 · C/S nueva escrita en la manga',
    'Orden AT_CHUTE: 007 "Novillito", 008 "NOVILLITO" (en mayúsculas), 009 "Reposición" (sólo la subcategoría: queda Vaquillona / Reposición) y 010 vacía (no cambia).',
    [
      animal(7, { cs_nueva: 'Novillito' }),
      animal(8, { cs_nueva: 'NOVILLITO' }),
      animal(9, { cs_nueva: 'Reposición' }),
      animal(10, { cs_nueva: '' }),
    ],
    header(range(7, 10).map((n) => animal(n)), { orden_transferencia: AT_CHUTE_ORDER_CODE })
  ),
  sheetCase(
    '33 · C/S nueva que no se resuelve',
    'Orden AT_CHUTE: 009 "Descarte" es ambiguo en una hembra (CATEGORY_TEXT_AMBIGUOUS), 010 "Búfalo" no existe (CATEGORY_TEXT_NOT_FOUND) y 007 "Reposición" no es de macho (CATEGORY_SEX_MISMATCH). La celda queda marcada y se elige de la lista.',
    [
      animal(7, { cs_nueva: 'Reposición' }),
      animal(8),
      animal(9, { cs_nueva: 'Descarte' }),
      animal(10, { cs_nueva: 'Búfalo' }),
    ],
    header(range(7, 10).map((n) => animal(n)), { orden_transferencia: AT_CHUTE_ORDER_CODE })
  ),
  sheetCase(
    '34 · Orden con la categoría declarada',
    'Orden DECLARED impresa con la C/S nueva. 013 se tachó y se escribió "Torito": vale la manga y avisa CATEGORY_DIFFERS_FROM_ORDER. 016 se leyó vacía: se aplica lo que declara la orden.',
    rows34,
    header(rows34, { orden_transferencia: DECLARED_ORDER_CODE })
  ),
  sheetCase(
    '36 · Por animal: lote, M y C/S nueva con abreviaturas',
    'Orden TR-20260615-0004 (por animal, todo en la manga). 001 "Novillito", 003 "Vaq / Repos" y 006 "Vaq/Desc" se resuelven; 002 "NOV" es ambiguo en un macho (Novillito o Novillo) y queda marcado; 004 "Torito"; 005 vacía no cambia. Igual que la imagen cact01_36.',
    range(1, 6).map((n, i) => {
      const written = ['Novillito', 'NOV', 'Vaq / Repos', 'Torito', '', 'Vaq/Desc'][i];
      const existing = n <= 3;

      return animal(n, {
        lote_destino: existing ? PASTURE : PENNED,
        manejo: existing ? 'P' : 'C',
        cs_nueva: written,
      });
    }),
    header(range(1, 6).map((n) => animal(n)), {
      orden_transferencia: PER_ANIMAL_AT_CHUTE_ORDER_CODE,
      lote_destino: '',
      sistema_manejo: '',
    })
  ),
  sheetCase(
    '38 · Planilla sin orden con C/S escrita',
    'Sin orden la hoja se decide entera en la manga, así que trae la columna C/S nueva en blanco. 002 → Novillito; 003 "Reposición" → Vaquillona / Reposición; 001 y 004 no cambian. Al confirmar se crea su orden (REGISTERED, en la manga). Igual que la imagen cact01_38.',
    [animal(1, { cs_nueva: '' }), animal(2, { cs_nueva: 'Novillito' }), animal(3, { cs_nueva: 'Reposición' }), animal(4, { cs_nueva: '' })],
    header(range(1, 4).map((n) => animal(n)))
  ),
  sheetCase(
    '35 · C/S nueva en una orden que no cambia la categoría',
    'La orden de siempre (KEEP) con "Novillo" escrito en 017: aviso CATEGORY_CHANGE_NOT_EXPECTED y la categoría no se toca.',
    orderRows.map((row, index) => (index === 0 ? { ...row, cs_nueva: 'Novillo' } : { ...row, cs_nueva: '' })),
    header(orderRows, { orden_transferencia: ORDER_CODE })
  ),
  sheetCase(
    '18 · Código de orden con O en lugar de 0',
    'TR-2026O615-0001: el resolver cambia la O por un cero, encuentra la orden y la carga la deja EJECUTADA.',
    orderRows,
    header(orderRows, { orden_transferencia: 'TR-2026O615-0001' })
  ),
  sheetCase(
    '19 · Código de orden que no existe',
    'TR-20260999-0042 está bien formado pero no existe: se espera TRANSFER_ORDER_NOT_FOUND en el encabezado.',
    rows27,
    header(rows27, { orden_transferencia: 'TR-20260999-0042' })
  ),
  sheetCase(
    '20 · Orden de otro lote',
    'La orden de "Test CACT Cría" sobre una planilla del lote de CAC-A: se espera TRANSFER_ORDER_SOURCE_MISMATCH. Requiere también ActivityChangeTestAnimalsSeeder.',
    cact20Rows,
    header(cact20Rows, {
      lote_origen: 'Lote Testing Cría (cambio actividad)',
      lote_destino: 'Recría Testing Declarada',
      sistema_manejo: 'CORRAL',
      orden_transferencia: ORDER_CODE,
    })
  ),
  sheetCase(
    '21 · Orden + un animal fuera del padrón',
    'La orden entera más GRO-001-CAR-001, que no estaba: aviso ANIMAL_NOT_IN_ORDER, se mueve igual y la orden queda EJECUTADA.',
    [...orderRows, animal(1, { id: '25', observations: 'No estaba en la orden' })],
    header([...orderRows, animal(1)], { orden_transferencia: ORDER_CODE })
  ),
  twoPageOrder(),
  sheetCase(
    '24 · Orden con otro destino escrito a mano',
    'La orden nombra "Test CACT Recría" y la manga escribió "Test CACT Recría Corral". Comportamiento a definir (§6 del plan).',
    orderRows,
    header(orderRows, { orden_transferencia: ORDER_CODE, lote_destino: PENNED, sistema_manejo: 'CORRAL' })
  ),
  sheetCase(
    '25 · Sexo, categoría y dentición contradicen al sistema',
    'SEX_MISMATCH (003), CATEGORY_MISMATCH (004) y TEETH_REGRESSION (025 está en 4D): tres avisos y nada modificado.',
    rows25,
    header(rows25)
  ),
  sheetCase(
    '26 · Totales del recuadro que no cierran',
    'El recuadro declara una cabeza y 50 kg de más que las filas: dos avisos SHEET_TOTAL_MISMATCH.',
    rows26,
    header(rows26, { total_cabezas: rows26.length + 1, peso_total: totals(rows26).peso_total + 50 })
  ),
  sheetCase('27 · Fecha futura', 'Planilla fechada 90 días adelante: se espera FUTURE_DATE.', rows27, header(rows27, { fecha_movimiento: futureDate() })),
  sheetCase(
    '28 · Lote de origen = lote de destino',
    'El destino escrito es "Test CACT Cría", el propio origen: se espera SAME_BATCH.',
    rows27,
    header(rows27, { lote_destino: SOURCE })
  ),
  sheetCase(
    '29 · Pesaje tardío',
    'Fechada el 01/09. GRO-001-CAR-026 tiene una pesada vigente del 15/09 (318 kg): los 300 kg entran a la historia sin desplazarla. 001 y 002 sí pasan a vigente.',
    rows29,
    header(rows29, { fecha_movimiento: '2026-09-01' })
  ),
  sheetCase(
    '39 · Lote de origen mal leído',
    'El encabezado dice "Test CACT Crío" (la A manuscrita leída como O) y no coincide con ningún lote. Las caravanas están en "Test CACT Cría": se propone ese lote con aviso ámbar para confirmar. GRO-001-CAR-099 no existe y se informa como no encontrada.',
    [...rows27, animal(99, { id: '99' })],
    header([...rows27, animal(99)], { lote_origen: 'Test CACT Crío' })
  ),
  sheetCase(
    '40 · Origen escrito contradice a las caravanas',
    'El encabezado dice "Test CACT Recría" (un lote que existe), pero las caravanas están en "Test CACT Cría": no se elige solo, se ofrecen los dos lotes para que el operador decida.',
    rows27,
    header(rows27, { lote_origen: PASTURE })
  ),
  sheetCase(
    '41 · Sexo y categoría sin leer',
    'Las filas 001–004 llegan sin sexo ni categoría: se completan en gris con lo que el sistema tiene y no se controlan. La 005 trae sexo H leído (en el sistema es M): se respeta y da SEX_MISMATCH.',
    rows41,
    header(rows41)
  ),
  sheetCase(
    '42 · Por animal con celdas de destino vacías',
    'El encabezado trae la marca "— por animal —" y la columna de destino tiene tres celdas escritas y dos vacías. No hay destino global: las dos vacías quedan sin destino, marcadas en su celda, y la carga no se confirma hasta definirlas.',
    rows42,
    header(rows42, { lote_destino: '— por animal —' })
  ),
];

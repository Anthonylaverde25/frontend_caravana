import { SimulationPreset } from './types';

/**
 * Simulated readings of a hand-filled ING-02 (no AI involved): the header cells as the agent would
 * return them and the breeds table as rows. They run against EntryOrderTestSeeder (provider
 * "Consignataria Test Ingreso", CUIT 30-71555000-1, and its two establishments):
 *     php artisan tenants:seed --class=EntryOrderTestSeeder
 *
 * Reading these sheets with the AI agent and generating their images is a later task.
 */

const REQUIRES = ' Requiere EntryOrderTestSeeder.';

const base = {
  templateCode: 'ING-02',
  templateTitle: 'Orden de Ingreso de Hacienda Externa',
  category: 'ENTRY' as const
};

const happyContext = {
  orden_ingreso: '',
  nombre_lote: 'Remate 412 (TEST ING)',
  proveedor: 'Consignataria Test Ingreso',
  cuit_proveedor: '30-71555000-1',
  establecimiento: 'Campo El Ombú (TEST ING)',
  renspa_origen: '02.345.6.78901/01',
  fecha_compra: '30/09/2026',
  cabezas: '40',
  categoria: 'Ternero',
  sexo: 'AMBOS',
  machos: '25',
  hembras: '15',
  peso_aprox: '180',
  peso_min: '160',
  peso_max: '200',
  desbaste: '3,5',
  estado: 'BUENO',
  edad: '9/10',
  sabe_comer: 'SI',
  garrapata: 'SI',
  observaciones: 'Tropa pareja, llega en dos jaulas.'
};

export const ING02_HAPPY_PATH: SimulationPreset = {
  ...base,
  scenario: 'HAPPY_PATH',
  scenarioLabel: '🟢 Compra en remate, 40 terneros de ambos sexos',
  scenarioDescription: 'Todo se identifica: proveedor por CUIT, establecimiento, categoría, dos razas con su pelaje.' + REQUIRES,
  context: happyContext,
  rows: [
    { raza: 'Braford', pelaje: 'Colorado' },
    { raza: 'Brangus', pelaje: 'Negro' }
  ]
};

export const ING02_WARNINGS: SimulationPreset = {
  ...base,
  scenario: 'WARNINGS',
  scenarioLabel: '🟡 Proveedor sin CUIT y campo sin identificar',
  scenarioDescription:
    'El proveedor está escrito a medias y sin CUIT, el establecimiento no coincide con ninguno y la edad no tiene el formato desde/hasta: se marcan para elegirlos en el formulario.' +
    REQUIRES,
  context: { ...happyContext, proveedor: 'Consignataria Test', cuit_proveedor: '', establecimiento: 'El Ombú', edad: '9 a 10' },
  rows: [{ raza: 'Angus', pelaje: 'Negro' }]
};

export const ING02_REPAIR_ERROR: SimulationPreset = {
  ...base,
  scenario: 'REPAIR_ERROR',
  scenarioLabel: '🔴 Vaquillonas marcadas como machos',
  scenarioDescription:
    'Contradicciones que el papel no puede tener: Vaquillona con MACHOS marcado, edad invertida (10/9), un pelaje que no es de la raza y "Sabe comer" sin marcar.' +
    REQUIRES,
  context: {
    ...happyContext,
    categoria: 'Vaquillona',
    sexo: 'MACHOS',
    machos: '',
    hembras: '',
    cabezas: '20',
    edad: '10/9',
    sabe_comer: ''
  },
  rows: [{ raza: 'Hereford', pelaje: 'Negro' }]
};

export const ING02_PRESETS = {
  HAPPY_PATH: ING02_HAPPY_PATH,
  WARNINGS: ING02_WARNINGS,
  REPAIR_ERROR: ING02_REPAIR_ERROR
};

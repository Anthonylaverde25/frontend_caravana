import type { IssueGuide } from '../types';

/** ING-02 / ING-03 · Orden de ingreso externo y recepción de su DTE. */
export const ING03_GUIDES: Record<string, IssueGuide> = {
  DTE_NOT_IN_ORDER: {
    category: 'order',
    title: 'DTE de otra orden',
    solution: 'El DTE no pertenece a esta orden de ingreso. Revisá el código de la orden en la hoja.'
  },
  SHEET_NOT_OF_DTE: {
    category: 'sheet',
    title: 'Hoja de otro DTE',
    solution: 'La hoja es de otro DTE. Cargá la hoja que corresponde a este DTE.'
  },
  DTE_NOTHING_PENDING: {
    category: 'order',
    title: 'DTE sin cabezas en tránsito',
    solution: 'Todo lo del DTE ya se recibió. Si la hoja ya se cargó, no hace falta cargarla de nuevo.'
  },
  ORDER_NOT_RECEIVING: {
    category: 'order',
    title: 'Orden que no recibe hacienda',
    solution: 'La orden de ingreso no está esperando hacienda. Revisá su estado en Órdenes de ingreso.'
  },
  DATE_IN_FUTURE: {
    category: 'dates',
    title: 'Fecha de recepción futura',
    solution: 'La fecha de recepción no puede ser posterior a hoy. Revisá la fecha leída.'
  },
  RECEIVED_BEFORE_DTE: {
    category: 'dates',
    title: 'Recepción anterior al DTE',
    solution: 'La hacienda no pudo llegar antes de la emisión del DTE. Revisá la fecha de recepción.'
  },
  NOTHING_TO_RECEIVE: {
    category: 'sheet',
    title: 'Recepción vacía',
    solution: 'La hoja no trae ninguna caravana. Escribí las caravanas recibidas.'
  },
  REASON_REQUIRED: {
    category: 'sheet',
    title: 'Falta el motivo del faltante',
    solution: 'Indicá por qué esas cabezas no van a llegar.'
  },
  MISSING_EXCEEDS_PENDING: {
    category: 'sheet',
    title: 'Faltante mayor a lo pendiente',
    solution: 'No pueden faltar más cabezas de las que siguen en tránsito. Corregí la cantidad.'
  },
  CARAVAN_MISSING: {
    category: 'animal',
    title: 'Falta la caravana',
    solution: 'Escribí la caravana del renglón, o borralo si está vacío.'
  },
  CARAVAN_DUPLICATED: {
    category: 'animal',
    title: 'Caravana repetida',
    solution: 'La misma caravana está en dos renglones. Dejá uno solo o corregí la mal leída.'
  },
  CARAVAN_EXISTS: {
    category: 'animal',
    title: 'Caravana ya existente',
    solution: 'La caravana ya existe en el sistema. Revisá la lectura.'
  },
  SEX_MISSING: {
    category: 'animal',
    title: 'Falta el sexo',
    solution: 'La tropa es de ambos sexos: indicá M (macho) o H (hembra).'
  },
  SEX_INVALID: {
    category: 'animal',
    title: 'Sexo ilegible',
    solution: 'El sexo tiene que ser M o H.'
  },
  SEX_CONTRADICTS_ORDER: {
    category: 'order',
    title: 'Sexo distinto al de la orden',
    solution: 'El sexo del renglón no corresponde a la composición de la orden. Revisá la lectura.'
  },
  CATEGORY_MISSING: {
    category: 'animal',
    title: 'Falta la categoría',
    solution: 'El sexo del animal admite más de una categoría de la orden: escribí su número (Cat.).'
  },
  CATEGORY_UNKNOWN: {
    category: 'animal',
    title: 'Categoría no declarada en la orden',
    solution: 'La orden no tiene una categoría con ese número. Revisá la lectura.'
  },
  CATEGORY_CONTRADICTS_SEX: {
    category: 'animal',
    title: 'Categoría distinta al sexo',
    solution: 'La categoría escrita no admite el sexo del animal. Revisá el sexo o la categoría.'
  },
  CATEGORY_NONE_FOR_SEX: {
    category: 'order',
    title: 'Ninguna categoría para ese sexo',
    solution: 'Ninguna categoría de la orden admite el sexo del animal. Revisá el sexo leído.'
  },
  BREED_UNKNOWN: {
    category: 'animal',
    title: 'Raza no declarada en la orden',
    solution: 'La orden no declara esa raza. Elegí una de las razas de la orden.'
  },
  WEIGHT_INVALID: {
    category: 'measures',
    title: 'Peso inválido',
    solution: 'El peso tiene que ser mayor que cero. Corregilo o dejalo vacío.'
  },
  BODY_CONDITION_INVALID: {
    category: 'measures',
    title: 'Condición corporal inválida',
    solution: 'La condición corporal va de 1 a 5 (se aceptan medios, por ejemplo 3.5).'
  },
  DTE_NUMBER_MISSING: {
    category: 'sheet',
    title: 'Falta el número de DTE',
    solution: 'Escribí el número de DTE.'
  },
  DTE_ALREADY_LOADED: {
    category: 'order',
    title: 'DTE ya cargado',
    solution: 'Ese DTE ya está cargado en otra orden. Revisá el número.'
  },
  DTE_BEFORE_PURCHASE: {
    category: 'dates',
    title: 'DTE anterior a la compra',
    solution: 'El DTE no pudo emitirse antes de la compra. Revisá la fecha.'
  },
  HEAD_COUNT_INVALID: {
    category: 'sheet',
    title: 'DTE sin cabezas',
    solution: 'El DTE tiene que declarar al menos una cabeza.'
  },
  BREED_AMBIGUOUS: {
    category: 'animal',
    title: 'Raza ambigua',
    solution: 'Lo escrito puede ser más de una raza de la orden. Elegí la correcta en el renglón o escribila completa.'
  },
  BREED_UNKNOWN_TEXT: {
    category: 'animal',
    title: 'Raza no reconocida',
    solution: 'No se reconoce la raza escrita. Elegí una de las razas de la orden o corregí lo leído.'
  },
  COLOR_REQUIRED: {
    category: 'animal',
    title: 'Falta el pelaje',
    solution: 'La orden tiene esa raza con más de un pelaje. Escribí o elegí el pelaje del animal.'
  },
  COLOR_AMBIGUOUS: {
    category: 'animal',
    title: 'Pelaje ambiguo',
    solution: 'Lo escrito puede ser más de un pelaje. Elegí el correcto o escribilo completo.'
  },
  COLOR_UNKNOWN_TEXT: {
    category: 'animal',
    title: 'Pelaje no reconocido',
    solution: 'No se reconoce el pelaje escrito. Elegí uno de los pelajes de la orden o corregí lo leído.'
  },
  CATEGORY_AMBIGUOUS: {
    category: 'animal',
    title: 'Categoría ambigua',
    solution: 'Lo escrito puede ser más de una categoría de la orden. Elegí la correcta o escribila completa.'
  },
  CATEGORY_UNKNOWN_TEXT: {
    category: 'animal',
    title: 'Categoría no reconocida',
    solution: 'Lo escrito no es una categoría de la orden. Elegí una de las categorías de la orden.'
  },
  REFERENCE_CONFLICT: {
    category: 'animal',
    title: 'Raza o categoría dos veces',
    solution: 'El renglón trae el dato por código y escrito. Dejá uno solo.'
  },
  // Warnings.
  BREED_NOT_IN_ORDER: {
    category: 'animal',
    title: 'Raza distinta a la comprada',
    solution: 'El animal es de una raza que la compra no declara. Se recibe así y queda una novedad para el proveedor.'
  },
  BREED_UNDECLARED: {
    category: 'animal',
    title: 'Raza sin declarar',
    solution: 'Si se sabe la raza, escribila; si no, queda sin declarar.'
  },
  WEIGHT_OUT_OF_RANGE: {
    category: 'measures',
    title: 'Peso fuera de rango',
    solution: 'Revisá el peso leído; si es correcto, no hace falta hacer nada.'
  }
};

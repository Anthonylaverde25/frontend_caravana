import type { IssueGuide } from '../types';

/** DEST-01 · Destete y Conformación de Lote de Destete. */
export const DEST01_GUIDES: Record<string, IssueGuide> = {
  WEANING_ORDER_NOT_FOUND: {
    category: 'order',
    title: 'Orden de destete inexistente',
    solution: 'Corregí el código si fue mal leído, o borralo si la hoja se llenó sin orden.'
  },
  WEANING_ORDER_NOT_EXECUTABLE: {
    category: 'order',
    title: 'Orden que no admite destetes',
    solution: 'La orden es un borrador o ya está cerrada. Emitila, o cargá la hoja con otra orden.'
  },
  WEANING_BEFORE_ORDER: {
    category: 'dates',
    title: 'Destete anterior a la orden',
    solution: 'La fecha de destete es anterior a la emisión de la orden. Revisá la fecha leída.'
  },
  ALREADY_WEANED_BY_ORDER: {
    category: 'order',
    title: 'Cría ya destetada por la orden',
    solution: 'Esa cría ya se destetó con esta orden. Borrá la fila: la hoja se está cargando de nuevo.'
  },
  NO_CALVES: {
    category: 'sheet',
    title: 'Hoja sin crías',
    solution: 'La planilla no tiene crías cargadas. Revisá la hoja o agregá las filas.'
  },
  NO_LINEAGE: {
    category: 'animal',
    title: 'Cría sin registro de nacimiento',
    solution: 'La caravana no tiene nacimiento registrado. Revisá la lectura, o registrá el parto antes de destetarla.'
  },
  ALREADY_WEANED: {
    category: 'outcome',
    title: 'Cría ya destetada',
    solution: 'La cría ya está destetada. Borrá la fila o revisá la caravana.'
  },
  WEANING_BEFORE_BIRTH: {
    category: 'dates',
    title: 'Destete anterior al nacimiento',
    solution: 'La fecha de destete es anterior al nacimiento de la cría. Revisá la fecha o la caravana.'
  },
  WEANING_TYPE_UNKNOWN: {
    category: 'sheet',
    title: 'Tipo de destete ilegible',
    solution: 'Marcá uno solo de Tradicional, Anticipado o Precoz, o dejalo vacío.'
  },
  BATCH_TARGET_MISSING: {
    category: 'destination',
    title: 'Falta el lote de destete',
    solution: 'Elegí o creá el lote de destete desde el selector.'
  },
  SEVERAL_DESTINATIONS: {
    category: 'destination',
    title: 'Varios destinos con destino único',
    solution: 'Con destino único todas las crías van a un lote. Unificá el destino o pasá a "lote por cría".'
  },
  BATCH_NOT_FOUND: {
    category: 'destination',
    title: 'Lote de destete inválido',
    solution: 'El lote elegido no existe, está cerrado o no es un lote de destete. Elegí otro desde el selector.'
  },
  DESTINATION_MISSING: {
    category: 'destination',
    title: 'Cría sin lote de destete',
    solution: 'Completá el lote de destete en la fila de la cría.'
  },
  CATEGORY_DIFFERS_FROM_ORDER: {
    category: 'order',
    title: 'Categoría distinta a la de la orden',
    solution: 'La orden pedía otra categoría. Revisá cuál corresponde.'
  },
  CATEGORY_CHANGE_NOT_EXPECTED: {
    category: 'order',
    title: 'Cambio de categoría no previsto',
    solution: 'La orden dice que la categoría no cambia: la escrita no se aplica.'
  },
  // Warnings.
  BATCH_NAME_SHARED: {
    category: 'destination',
    title: 'Nombre igual a otro lote',
    solution: 'Conviene darle otro nombre al lote nuevo para distinguirlo.'
  },
  WEANING_TYPE_DIFFERS_FROM_ORDER: {
    category: 'order',
    title: 'Tipo de destete distinto al de la orden',
    solution: 'Vale el tipo de destete que declara la orden.'
  },
  WEIGHT_OUTLIER: {
    category: 'measures',
    title: 'Peso fuera de lo esperable',
    solution: 'Revisá el peso leído; si es correcto, no hace falta hacer nada.'
  }
};

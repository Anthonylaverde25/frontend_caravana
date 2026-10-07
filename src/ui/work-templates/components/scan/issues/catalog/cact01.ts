import type { IssueGuide } from '../types';

/** CACT-01 · Cambio de Actividad de Hacienda. */
export const CACT01_GUIDES: Record<string, IssueGuide> = {
  TRANSFER_ORDER_NOT_FOUND: {
    category: 'order',
    title: 'Orden de transferencia inexistente',
    solution: 'Corregí el código si fue mal leído. Si no, usá "Obtener orden de transferencia" para generarla desde la hoja.'
  },
  TRANSFER_ORDER_NOT_EXECUTABLE: {
    category: 'order',
    title: 'Orden que no admite movimientos',
    solution: 'La orden es un borrador o ya está cerrada. Emitila, o cargá la hoja con otra orden.'
  },
  TRANSFER_ORDER_SOURCE_MISMATCH: {
    category: 'order',
    title: 'Orden de otro lote de origen',
    solution: 'La orden es de otro lote. Elegí como lote de origen el de la orden, o corregí el código.'
  },
  TRANSFER_ORDER_ACTIVITY_MISMATCH: {
    category: 'order',
    title: 'Orden con otra actividad de destino',
    solution: 'La actividad de destino de la hoja no es la de la orden. Usá la actividad de la orden.'
  },
  MOVEMENT_BEFORE_ORDER: {
    category: 'dates',
    title: 'Movimiento anterior a la orden',
    solution: 'La fecha del movimiento es anterior a la emisión de la orden. Revisá la fecha leída.'
  },
  ALREADY_MOVED_BY_ORDER: {
    category: 'order',
    title: 'Animal ya movido por la orden',
    solution: 'Ese animal ya se movió con esta orden. Borrá la fila: la hoja se está cargando de nuevo.'
  },
  SOURCE_BATCH_NOT_FOUND: {
    category: 'destination',
    title: 'Lote de origen inexistente o cerrado',
    solution: 'Elegí el lote de origen con el selector del encabezado.'
  },
  NOT_IN_SOURCE_BATCH: {
    category: 'animal',
    title: 'Animal de otro lote',
    solution: 'El animal no está en el lote de origen. Revisá la caravana, o elegí el lote de origen correcto.'
  },
  NO_ANIMALS: {
    category: 'sheet',
    title: 'Hoja sin animales',
    solution: 'La planilla no tiene animales cargados. Revisá la hoja o agregá las filas.'
  },
  SHEET_TOTAL_MISMATCH: {
    category: 'sheet',
    title: 'Total de cabezas distinto',
    solution: 'El total del recuadro no coincide con las filas. Buscá filas faltantes o de más, o corregí el total.'
  },
  DESTINATION_ACTIVITY_NOT_FOUND: {
    category: 'destination',
    title: 'Actividad de destino inválida',
    solution: 'Elegí la actividad de destino en el encabezado.'
  },
  SAME_BATCH: {
    category: 'destination',
    title: 'Destino igual al origen',
    solution: 'El destino es el mismo lote de origen. Elegí otro lote de destino.'
  },
  DESTINATION_NAME_IN_OTHER_ACTIVITY: {
    category: 'destination',
    title: 'Nombre usado en otra actividad',
    solution: 'Ya existe un lote con ese nombre en otra actividad. Conviene darle otro nombre al lote nuevo.'
  },
  NEW_BATCH_ACTIVITY_MISMATCH: {
    category: 'destination',
    title: 'Lote nuevo en otra actividad',
    solution: 'El lote nuevo se crearía en una actividad distinta a la de destino. Revisá la actividad del lote nuevo.'
  },
  MANAGEMENT_SYSTEM_UNDECLARED: {
    category: 'destination',
    title: 'Lote sin sistema de manejo',
    solution: 'El lote de destino no declara si es corral o pastura. Completalo desde la ficha del lote.'
  },
  CATEGORY_NOT_FOUND: {
    category: 'animal',
    title: 'Categoría inexistente',
    solution: 'Elegí la categoría (y subcategoría) en el selector de la fila.'
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
  ACTIVITY_MISMATCH: {
    category: 'destination',
    title: 'Actividad de origen distinta',
    solution: 'La hoja dice otra actividad de origen; vale la del lote.'
  },
  CATEGORY_MISMATCH: {
    category: 'animal',
    title: 'Categoría distinta a la registrada',
    solution: 'Se conserva la categoría del sistema. Si está mal, corregila desde la ficha del animal.'
  },
  TEETH_REGRESSION: {
    category: 'measures',
    title: 'Dentición menor a la registrada',
    solution: 'La dentición sólo avanza: se conserva la registrada.'
  },
  MANAGEMENT_SYSTEM_DIFFERS: {
    category: 'destination',
    title: 'Manejo distinto al del lote',
    solution: 'Vale el sistema de manejo que declara el lote.'
  },
  PREGNANT_TO_CULL: {
    category: 'animal',
    title: 'Hembra preñada a descarte',
    solution: 'Confirmá que corresponde mandar a descarte una hembra preñada.'
  },
  CATEGORY_WEIGHT_OUT_OF_RANGE: {
    category: 'measures',
    title: 'Peso fuera del rango de la categoría',
    solution: 'Revisá el peso o la categoría nueva del animal.'
  }
};

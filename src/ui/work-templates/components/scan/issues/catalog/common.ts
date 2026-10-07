import type { IssueGuide } from '../types';

/**
 * Codes several templates answer with the same meaning. A template's own catalog wins over these
 * when the same code means something more specific there.
 */
export const COMMON_GUIDES: Record<string, IssueGuide> = {
  NOT_FOUND: {
    category: 'animal',
    title: 'Caravana inexistente',
    solution: 'Compará la caravana con la foto de la hoja: suele ser una lectura equivocada (0 por O, 1 por I). Corregila en la fila o borrá la fila si el animal no corresponde.'
  },
  DUPLICATED_IN_SHEET: {
    category: 'animal',
    title: 'Caravana repetida en la hoja',
    solution: 'El mismo animal figura en dos filas. Dejá una sola: borrá la repetida o corregí la caravana mal leída.'
  },
  INVALID_WEIGHT: {
    category: 'measures',
    title: 'Peso inválido',
    solution: 'El peso tiene que ser un número mayor a cero. Corregilo con el valor de la hoja, o dejalo vacío si no se pesó.'
  },
  INVALID_TEETH: {
    category: 'measures',
    title: 'Dentición inválida',
    solution: 'Usá uno de los valores de la planilla (DL, 2D, 4D, 6D, 8D, Boca llena) o un número no negativo.'
  },
  FUTURE_DATE: {
    category: 'dates',
    title: 'Fecha futura',
    solution: 'La fecha del encabezado no puede ser posterior a hoy. Revisá el día, el mes y el año leídos.'
  },
  DATE_INVALID: {
    category: 'dates',
    title: 'Fecha ilegible',
    solution: 'La fecha no es válida. Escribila de nuevo con el formato dd/mm/aaaa.'
  },
  DATE_MISSING: {
    category: 'dates',
    title: 'Falta la fecha',
    solution: 'Completá la fecha de la fila. Si es la misma para todas, usá el botón que copia la fecha del encabezado.'
  },
  DESTINATION_MISSING: {
    category: 'destination',
    title: 'Fila sin destino',
    solution: 'Indicá el lote de destino en la fila o, si todos van al mismo, en el encabezado.'
  },
  UNKNOWN_DESTINATION: {
    category: 'destination',
    title: 'Destino no confirmado',
    solution: 'El destino de la fila no está entre los confirmados. Elegí uno de la lista de destinos o confirmá ese destino antes.'
  },
  BATCH_NOT_FOUND: {
    category: 'destination',
    title: 'Lote inexistente o cerrado',
    solution: 'Elegí un lote activo con el selector, o creá uno nuevo desde el modal de lotes.'
  },
  DUPLICATED_DESTINATION: {
    category: 'destination',
    title: 'Destino repetido',
    solution: 'El mismo lote figura dos veces como destino. Uní los dos grupos en uno solo.'
  },
  BATCH_NAME_IN_USE: {
    category: 'destination',
    title: 'Nombre de lote en uso',
    solution: 'Ya existe un lote activo con ese nombre. Elegilo como lote existente o poné otro nombre al nuevo.'
  },
  MANAGEMENT_SYSTEM_MISSING: {
    category: 'destination',
    title: 'Falta el sistema de manejo',
    solution: 'Indicá si el lote nuevo se maneja a corral o a pastura.'
  },
  MANAGEMENT_SYSTEM_CONFLICT: {
    category: 'destination',
    title: 'Manejo contradictorio',
    solution: 'Las filas del mismo lote dicen corral y pastura. Vale lo que declara el lote; si hay que cambiarlo, hacelo desde el lote.'
  },
  DESTINATION_ACTIVITY_MISMATCH: {
    category: 'destination',
    title: 'Lote de otra actividad',
    solution: 'El lote elegido no es de la actividad de destino. Elegí un lote de esa actividad o creá uno nuevo.'
  },
  ANIMAL_IN_OPEN_ORDER: {
    category: 'order',
    title: 'Animal comprometido en otra orden',
    solution: 'El animal ya está en otra orden abierta. Cargalo con esa orden, o ejecutala, cerrala o anulala primero.'
  },
  ANIMAL_NOT_IN_ORDER: {
    category: 'order',
    title: 'Animal fuera de la orden',
    solution: 'La orden no lista este animal. Revisá la caravana; si corresponde, cargalo sin orden o con la orden que lo incluye.'
  },
  CATEGORY_TEXT_AMBIGUOUS: {
    category: 'animal',
    title: 'Categoría ambigua',
    solution: 'Lo escrito coincide con más de una categoría. Elegí la correcta en el selector de la fila.'
  },
  CATEGORY_TEXT_NOT_FOUND: {
    category: 'animal',
    title: 'Categoría desconocida',
    solution: 'Lo escrito no es una categoría ni subcategoría del catálogo. Elegila en el selector de la fila.'
  },
  CATEGORY_SEX_MISMATCH: {
    category: 'animal',
    title: 'Categoría de otro sexo',
    solution: 'La categoría elegida no corresponde al sexo del animal. Elegí una categoría de su sexo.'
  },
  BREED_UNKNOWN: {
    category: 'calf',
    title: 'Raza desconocida',
    solution: 'Elegí la raza en el selector; si no está, dejala vacía.'
  },
  NO_ROWS: {
    category: 'sheet',
    title: 'Hoja sin filas',
    solution: 'La planilla no tiene filas cargadas. Revisá que la hoja sea la correcta o agregá las filas a mano.'
  },
  LOCAL_CHECK: {
    category: 'sheet',
    title: 'Revisión de la hoja',
    solution: 'Resolvelo en la revisión antes de confirmar.'
  }
};

import type { IssueGuide } from '../types';

/** PAR-01 · Planilla de Parición. */
export const PAR01_GUIDES: Record<string, IssueGuide> = {
  BIRTH_ORDER_NOT_FOUND: {
    category: 'order',
    title: 'Orden de parición inexistente',
    solution: 'Corregí el código en "Orden de parición" si fue mal leído. Si la hoja se llenó sin orden, borralo y usá "Obtener orden de parición".'
  },
  BIRTH_ORDER_NOT_EXECUTABLE: {
    category: 'order',
    title: 'Orden que no admite partos',
    solution: 'La orden es un borrador o ya está cerrada. Emitila desde Órdenes de parición, o cargá la hoja con otra orden.'
  },
  DUPLICATED_IN_SHEET: {
    category: 'animal',
    title: 'Vientre repetido en la hoja',
    solution: 'La misma madre figura en dos filas. Dejá una sola, con el resultado correcto.'
  },
  MOTHER_MISSING: {
    category: 'animal',
    title: 'Fila sin madre',
    solution: 'La fila tiene datos pero no dice de qué hembra es. Escribí la caravana de la madre o borrá la fila.'
  },
  MOTHER_NOT_FOUND: {
    category: 'animal',
    title: 'Madre inexistente',
    solution: 'Compará la caravana de la madre con la foto: suele ser una lectura equivocada. Corregila o borrá la fila.'
  },
  NOT_A_FEMALE: {
    category: 'animal',
    title: 'La caravana no es de una hembra',
    solution: 'La caravana de la madre es de un macho. Revisá la lectura: probablemente es otra caravana.'
  },
  ANIMAL_IN_OPEN_ORDER: {
    category: 'order',
    title: 'Vientre en otra orden de parición',
    solution: 'La hembra está en otra orden abierta. Cargá su parto con esa orden, o cerrala o anulala primero.'
  },
  ANIMAL_NOT_IN_ORDER: {
    category: 'order',
    title: 'Vientre fuera de la orden',
    solution: 'La hembra no está en la orden. Revisá la caravana; si parió sin estar en el plan, marcá «Fuera de orden».'
  },
  OUTSIDE_ORDER_NOT_DECLARED: {
    category: 'order',
    title: 'Parto fuera de orden sin declarar',
    solution: 'La hembra no está en la orden. Si parió sin estar en el plan, marcá la casilla «Fuera de orden»; si no, corregí la caravana.'
  },
  NO_ACTIVE_GESTATION: {
    category: 'outcome',
    title: 'Sin preñez en curso',
    solution: 'La hembra no tiene una preñez registrada. Revisá la caravana, o registrá el tacto en Monitoreo Gestacional antes de cargar el parto.'
  },
  GESTATION_CLOSED: {
    category: 'outcome',
    title: 'Preñez ya cerrada',
    solution: 'La preñez que listaba la orden se cerró por otro camino (por ejemplo, un aborto). Borrá la fila; si no queda nada por registrar, cerrá la orden incompleta.'
  },
  OUTCOME_NOT_ON_SHEET: {
    category: 'outcome',
    title: 'Aborto marcado en la planilla',
    solution: 'El aborto no se carga en la planilla de parición. Registralo en Monitoreo Gestacional y dejá la fila sin marcar.'
  },
  OUTCOME_UNKNOWN: {
    category: 'outcome',
    title: 'Resultado ilegible',
    solution: 'Marcá uno solo de V (parió), NM (nació muerto) o M (murió al pie); se puede combinar con N.'
  },
  OUTCOME_MISSING: {
    category: 'outcome',
    title: 'Falta el resultado',
    solution: 'La fila tiene datos de cría pero no dice qué pasó. Marcá V, NM o M; si no parió todavía, borrá los datos de cría.'
  },
  OUTCOME_MISSING_WITH_OVERDUE: {
    category: 'outcome',
    title: 'N con datos de cría',
    solution: 'Si parió, marcá además V, NM o M. Si no parió, borrá los datos de cría y dejá sólo la N.'
  },
  OVERDUE_NEEDS_ORDER: {
    category: 'order',
    title: 'N sin orden de parición',
    solution: 'La alerta de "no parió" queda guardada en una orden. Usá "Obtener orden de parición" antes de confirmar.'
  },
  OVERDUE_NOT_IN_ORDER: {
    category: 'order',
    title: 'N de una hembra fuera de la orden',
    solution: 'La N avisa de una hembra de la orden que no parió. Revisá la caravana o quitá la N.'
  },
  LOSS_REASON_MISSING: {
    category: 'sheet',
    title: 'Falta configurar un motivo de pérdida',
    solution: 'La empresa no tiene el motivo de pérdida que corresponde al resultado. Configuralo en los catálogos y volvé a confirmar.'
  },
  MOTHER_WITHOUT_BATCH: {
    category: 'destination',
    title: 'Madre sin lote',
    solution: 'La cría nace en el lote de su madre, y la madre no está en ninguno. Asignala a un lote y volvé a confirmar.'
  },
  DATE_BEFORE_GESTATION: {
    category: 'dates',
    title: 'Parto antes de la preñez',
    solution: 'La fecha del parto es anterior al inicio de la preñez. Revisá la fecha leída.'
  },
  CALF_TAG_MISSING: {
    category: 'calf',
    title: 'Falta la caravana de la cría',
    solution: 'Un ternero vivo necesita su caravana. Escribila; si nació muerto, marcá NM.'
  },
  CALF_TAG_DUPLICATED: {
    category: 'calf',
    title: 'Caravana de cría repetida',
    solution: 'Dos crías tienen la misma caravana. Corregí la mal leída.'
  },
  CALF_TAG_IN_USE: {
    category: 'calf',
    title: 'Caravana de cría en uso',
    solution: 'Ya existe un animal con esa caravana. Revisá la lectura o usá otra caravana.'
  },
  CALF_SEX_MISSING: {
    category: 'calf',
    title: 'Falta el sexo de la cría',
    solution: 'Elegí M (macho) o H (hembra) en la fila.'
  },
  CALF_SEX_UNKNOWN: {
    category: 'calf',
    title: 'Sexo de cría ilegible',
    solution: 'El sexo tiene que ser M (macho) o H (hembra).'
  },
  INVALID_WEIGHT: {
    category: 'measures',
    title: 'Peso de cría inválido',
    solution: 'El peso tiene que ser mayor a cero. Corregilo o dejalo vacío.'
  },
  COLOR_UNKNOWN: {
    category: 'calf',
    title: 'Pelaje desconocido',
    solution: 'Elegí el pelaje en el selector; si no está, dejalo vacío.'
  },
  COLOR_NOT_OF_BREED: {
    category: 'calf',
    title: 'Pelaje de otra raza',
    solution: 'El pelaje elegido no corresponde a la raza de la cría. Cambiá la raza o el pelaje.'
  },
  FATHER_NOT_FOUND: {
    category: 'calf',
    title: 'Padre inexistente',
    solution: 'Elegí el padre en el selector, o dejalo vacío para usar el toro del servicio.'
  },
  FATHER_NOT_MALE: {
    category: 'calf',
    title: 'El padre no es macho',
    solution: 'Elegí un toro como padre, o dejalo vacío para usar el toro del servicio.'
  },
  NOTHING_RESOLVED: {
    category: 'sheet',
    title: 'Sin novedades que guardar',
    solution: 'Ningún vientre tiene un resultado nuevo. Si la hoja ya se cargó, no hace falta volver a cargarla.'
  },
  // Warnings (they come with a saved load and do not block it).
  ALREADY_RESOLVED_DIFFERS: {
    category: 'outcome',
    title: 'Distinto a lo ya registrado',
    solution: 'Se conserva lo registrado. Si lo registrado está mal, corregilo desde la orden.'
  },
  CALF_DATA_IGNORED: {
    category: 'calf',
    title: 'Datos de cría ignorados',
    solution: 'Con NM o M no se da de alta ninguna cría: la caravana, el peso, la raza y el pelaje escritos no se guardan.'
  },
  DATE_FAR_FROM_DUE: {
    category: 'dates',
    title: 'Parto lejos de la fecha probable',
    solution: 'Confirmá la fecha leída; si es correcta, no hace falta hacer nada.'
  },
  OVERDUE_BEFORE_DUE: {
    category: 'dates',
    title: 'N antes de la fecha probable',
    solution: 'Todavía no venció la fecha probable de parto. Si la N es correcta, queda como aviso.'
  }
};

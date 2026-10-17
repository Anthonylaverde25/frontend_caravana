import type { IssueGuide } from '../types';

/** LSER-01 · Acta de Inicio de Servicio sobre un lote de Cría. */
export const LSER01_GUIDES: Record<string, IssueGuide> = {
  BATCH_NOT_FOUND: {
    category: 'destination',
    title: 'Lote inexistente',
    solution: 'Elegí en el encabezado el lote de Cría que entra en servicio.'
  },
  BATCH_NOT_ELIGIBLE: {
    category: 'destination',
    title: 'El lote no puede entrar en servicio',
    solution: 'El lote no es propio de Cría o ya tiene un servicio en curso. Elegí otro lote o cerrá el servicio actual.'
  },
  NOT_IN_BATCH: {
    category: 'destination',
    title: 'Vientre fuera del lote',
    solution: 'La caravana no está en el lote del encabezado. Transferí el vientre al lote o revisá la caravana.'
  },
  BULL_NOT_FOUND: {
    category: 'animal',
    title: 'Toro inexistente',
    solution: 'Compará la caravana del toro con la foto y corregila en el encabezado.'
  },
  BULL_NOT_MALE: {
    category: 'animal',
    title: 'La caravana del toro no es de un macho',
    solution: 'Revisá la caravana del toro en el encabezado: probablemente es otra.'
  },
  BULL_NOT_FIT: {
    category: 'outcome',
    title: 'Toro no habilitado',
    solution: 'El toro está excluido de reproducción por el ganadero (habilitalo desde /herd) o bloqueado por un dictamen veterinario (rechazo sanitario o tratamiento). Elegí otro toro.'
  },
  IN_ACTIVE_ORDER: {
    category: 'order',
    title: 'Toro en otra orden de servicio',
    solution: 'El toro ya está en otra orden de servicio activa. Cerrala o elegí otro toro.'
  },
  EXTERNAL_BATCH: {
    category: 'destination',
    title: 'Toro en un lote externo',
    solution: 'El toro está en un lote externo. Ingresalo a un lote propio antes de iniciar el servicio.'
  },
  NOT_FEMALE: {
    category: 'animal',
    title: 'La caravana no es de una hembra',
    solution: 'Revisá la caravana: la tabla del acta lleva sólo vientres.'
  },
  PREGNANT: {
    category: 'outcome',
    title: 'Hembra preñada',
    solution: 'La hembra tiene una preñez activa: no entra al servicio. Borrá la fila o revisá la caravana.'
  },
  NO_FEMALES: {
    category: 'sheet',
    title: 'Hoja sin hembras',
    solution: 'La planilla no tiene hembras cargadas. Revisá la hoja o agregá las filas.'
  }
};

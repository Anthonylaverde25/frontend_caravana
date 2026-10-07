import type { IssueGuide } from '../types';

/** LSER-01 · Conformación de Lote de Servicio. */
export const LSER01_GUIDES: Record<string, IssueGuide> = {
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
  BULL_WITHOUT_CATEGORY: {
    category: 'animal',
    title: 'Toro sin categoría',
    solution: 'Asignale una categoría al toro desde su ficha y volvé a confirmar.'
  },
  BULL_NOT_FIT: {
    category: 'outcome',
    title: 'Toro no apto',
    solution: 'El toro no aprobó su revisión andrológica. Elegí otro toro, o registrá una revisión apta (TOR-01).'
  },
  IN_ACTIVE_ORDER: {
    category: 'order',
    title: 'Toro en otra orden de servicio',
    solution: 'El toro ya está en otra orden de servicio activa. Cerrala o elegí otro toro.'
  },
  EXTERNAL_BATCH: {
    category: 'destination',
    title: 'Toro en un lote externo',
    solution: 'El toro está en un lote externo. Ingresalo a un lote propio antes de armar el servicio.'
  },
  NOT_FEMALE: {
    category: 'animal',
    title: 'La caravana no es de una hembra',
    solution: 'Revisá la caravana: el lote de servicio lleva sólo hembras.'
  },
  WITHOUT_CATEGORY: {
    category: 'animal',
    title: 'Hembra sin categoría',
    solution: 'Asignale una categoría a la hembra desde su ficha y volvé a confirmar.'
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
  },
  CATEGORY_MISMATCH: {
    category: 'animal',
    title: 'Hembra de otra categoría',
    solution: 'La categoría de la hembra no es la del lote de servicio. Revisá la caravana o la categoría del lote.'
  }
};

import { z } from 'zod';

/**
 * Batch Schema
 */
export const batchSchema = z.object({
  name: z.string().min(1, 'El nombre del lote es requerido'),
  provider_id: z.number({ required_error: 'Debe seleccionar un proveedor' }).positive('Selección de proveedor inválida'),
  farm_id: z.number({ required_error: 'Debe seleccionar un establecimiento' }).positive('Selección de establecimiento inválida'),
  activity_id: z.number({ required_error: 'Debe seleccionar una actividad inicial' }).positive('Selección de actividad inválida'),
  batch_type_id: z.number({ required_error: 'Debe seleccionar un tipo de lote' }).positive('Selección de tipo de lote inválida'),
  weight: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().positive('El peso debe ser un número positivo').optional()),
  observaciones: z.string().optional().nullable(),
});

export interface BatchFormValues {
  name?: string;
  provider_id?: number;
  farm_id?: number;
  activity_id?: number;
  batch_type_id?: number;
  weight?: any;
  observaciones?: string | null;
}

import { z } from 'zod';

/**
 * Batch Schema
 */
export const batchSchema = z.object({
  name: z.string().min(1, 'El nombre del lote es requerido'),
  provider_id: z.number({ required_error: 'Debe seleccionar un proveedor' }).positive('Selección de proveedor inválida'),
  farm_id: z.number({ required_error: 'Debe seleccionar un establecimiento' }).positive('Selección de establecimiento inválida'),
  observaciones: z.string().optional().nullable(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;

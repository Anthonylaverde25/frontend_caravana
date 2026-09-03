import { z } from 'zod';

/**
 * Batch Schema
 */
export const batchSchema = z.object({
  name: z.string().min(1, 'El nombre del lote es requerido'),
  is_own: z.boolean().default(true),
  provider_id: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().positive('Selección de proveedor inválida').optional().nullable()),
  farm_id: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().positive('Selección de establecimiento inválida').optional().nullable()),
  activity_id: z.number({ required_error: 'Debe seleccionar una actividad inicial' }).positive('Selección de actividad inválida'),
  batch_type_id: z.number({ required_error: 'Debe seleccionar un tipo de lote' }).positive('Selección de tipo de lote inválida'),
  weight: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().positive('El peso debe ser un número positivo').optional()),
  min_weight: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().positive('El peso mínimo debe ser un número positivo').optional().nullable()),
  max_weight: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().positive('El peso máximo debe ser un número positivo').optional().nullable()),
  knows_to_eat: z.boolean().default(false),
  age_in_months: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().int().nonnegative('La edad debe ser mayor o igual a 0').optional().nullable()),
  observaciones: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (!data.is_own) {
    if (!data.provider_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar un proveedor',
        path: ['provider_id']
      });
    }
    if (!data.farm_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar un establecimiento',
        path: ['farm_id']
      });
    }
  }

  if (data.min_weight !== undefined && data.min_weight !== null && data.max_weight !== undefined && data.max_weight !== null) {
    if (data.max_weight < data.min_weight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El peso máximo debe ser mayor o igual al peso mínimo',
        path: ['max_weight']
      });
    }
  }
});

export type BatchFormValues = z.infer<typeof batchSchema>;

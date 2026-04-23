import { z } from 'zod';

/**
 * Caravan Schema
 * Based on App\Models\Caravan
 */
export const caravanSchema = z.object({
  identification: z.string().min(1, 'La identificación es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  sex: z.string().min(1, 'El sexo es requerido'),
  breed_id: z.number().int().optional().nullable(),
  teeth: z.number().int().min(0).max(99).default(0),
  entry_weight: z.number().positive('El peso debe ser mayor a 0').optional().nullable(),
  exit_weight: z.number().positive().optional().nullable(),
  entry_date: z.string().min(1, 'La fecha de entrada es requerida'),
});

export type CaravanFormValues = z.infer<typeof caravanSchema>;

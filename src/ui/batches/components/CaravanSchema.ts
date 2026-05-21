import { z } from 'zod';

/**
 * Caravan Schema
 * Based on App\Models\Caravan
 */
export const caravanSchema = z.object({
  identification: z.string().min(1, 'La identificación es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  sex: z.enum(['M', 'H'], { errorMap: () => ({ message: 'El sexo debe ser M (Macho) o H (Hembra)' }) }),
  breed_id: z.number().int().optional().nullable(),
  teeth: z.number().int().min(0).max(99).default(0),
  entry_weight: z.number().positive('El peso debe ser mayor a 0').optional().nullable(),
  entry_date: z.string().min(1, 'La fecha de entrada es requerida'),
  is_empty: z.union([z.boolean(), z.string()]).transform(val => val === 'true' || val === true).optional().nullable(),
});

export type CaravanFormValues = z.infer<typeof caravanSchema>;

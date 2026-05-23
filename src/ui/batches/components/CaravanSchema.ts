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
  is_empty: z.union([z.boolean(), z.string()]).optional().nullable(),
  gestation_stage: z.string().optional().nullable(),
  gestation_months: z.number().min(0).max(12).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.sex === 'H' && (data.is_empty === false || data.is_empty === 'false')) {
    const hasStage = !!data.gestation_stage && ['head', 'body', 'tail'].includes(data.gestation_stage);
    const hasMonths = typeof data.gestation_months === 'number' && data.gestation_months >= 0 && data.gestation_months <= 12;

    if (!hasStage && !hasMonths) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El estado de preñez o los meses de gestación son requeridos',
        path: ['gestation_stage'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El estado de preñez o los meses de gestación son requeridos',
        path: ['gestation_months'],
      });
    } else {
      if (data.gestation_stage && !['head', 'body', 'tail'].includes(data.gestation_stage)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El estado de preñez seleccionado no es válido',
          path: ['gestation_stage'],
        });
      }
      if (data.gestation_months !== undefined && data.gestation_months !== null && (data.gestation_months < 0 || data.gestation_months > 12)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Los meses de gestación deben estar entre 0 y 12',
          path: ['gestation_months'],
        });
      }
    }
  }
});

export type CaravanFormValues = z.infer<typeof caravanSchema>;

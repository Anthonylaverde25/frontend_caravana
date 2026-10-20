import { z } from 'zod';
import { cuitReason } from '@/core/shared/domain/cuit';

/**
 * Farm Schema
 */
export const farmSchema = z.object({
  name: z.string().min(1, 'El nombre del establecimiento es requerido'),
  renspa: z.string().optional().default(''),
  country: z.string().min(1, 'El país es requerido'),
  province: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  zip: z.string().optional(),
});

/**
 * Supplier Schema
 */
export const supplierSchema = z.object({
  name: z.string().min(1, 'La razón social es requerida'),
  commercial_name: z.string().optional().nullable(),
  // The backend refuses it too; checked here so the message shows on the same click.
  cuit: z
    .string()
    .min(1, 'El CUIT es requerido')
    .superRefine((value, ctx) => {
      const reason = cuitReason(value);
      if (reason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: reason });
    }),
  location: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  // A nested object, so its rule is checked on the same click as the other fields (a refine on
  // the whole form would only run once every other field is valid).
  roles: z
    .object({
      supplies_livestock: z.boolean(),
      supplies_items: z.boolean(),
    })
    .refine((roles) => roles.supplies_livestock || roles.supplies_items, {
      message: 'Marcá al menos qué vende: hacienda, o artículos y servicios.',
    }),
  farms: z.array(farmSchema).optional().default([]),
});

export type FarmFormValues = z.infer<typeof farmSchema>;
export type SupplierFormValues = z.infer<typeof supplierSchema>;

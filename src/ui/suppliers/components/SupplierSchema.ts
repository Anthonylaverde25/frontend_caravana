import { z } from 'zod';

/**
 * Farm Schema
 */
export const farmSchema = z.object({
  name: z.string().min(1, 'El nombre del establecimiento es requerido'),
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
  cuit: z.string().min(1, 'El CUIT es requerido'),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  farms: z.array(farmSchema).min(1, 'Debe agregar al menos un establecimiento asociada'),
});

export type FarmFormValues = z.infer<typeof farmSchema>;
export type SupplierFormValues = z.infer<typeof supplierSchema>;

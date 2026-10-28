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

const PARTNER_ROLE_CODES = ['SUPPLIER_LIVESTOCK', 'SUPPLIER_ITEMS', 'CUSTOMER_LIVESTOCK', 'CUSTOMER_ITEMS'] as const;

/**
 * A contact person (C6): name and phone always, a valid email when there is one.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Falta el nombre de la persona de contacto.'),
  phone: z.string().trim().min(1, 'Falta el teléfono: es obligatorio para una persona de contacto.'),
  position: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable(),
});

/**
 * Partner Schema. The first contact is optional: left empty it is not sent; with anything in it,
 * name and phone are required (checked when the main button is clicked).
 */
export const partnerSchema = z.object({
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
  roles: z.array(z.enum(PARTNER_ROLE_CODES)).min(1, 'Marcá al menos un rol: qué nos vende o qué nos compra.'),
  contact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('Email inválido').optional().or(z.literal('')),
    })
    .superRefine((contact, ctx) => {
      const filled = [contact.name, contact.phone, contact.email].some((value) => value?.trim());
      if (!filled) return;
      if (!contact.name?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Falta el nombre de la persona de contacto.' });
      if (!contact.phone?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: 'Falta el teléfono: es obligatorio para una persona de contacto.' });
    }),
  farms: z.array(farmSchema).optional().default([]),
});

export type FarmFormValues = z.infer<typeof farmSchema>;
export type PartnerFormValues = z.infer<typeof partnerSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;

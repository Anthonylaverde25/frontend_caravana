import { z } from 'zod';

export const itemFormSchema = z.object({
	behavior: z.enum(['STOCKED_ARTICLE', 'EXPENSE_ARTICLE', 'SERVICE']),
	name: z.string().trim().min(1, 'El nombre es obligatorio.').max(150),
	code: z
		.string()
		.trim()
		.max(32)
		.regex(/^[A-Za-z0-9_-]*$/, 'Sólo letras, números, guion y guion bajo.'),
	unit_of_measure_id: z.number().int().positive('Elegí la unidad.'),
	item_category_id: z.number().int().positive().nullable(),
	description: z.string().max(2000)
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

export const EMPTY_ITEM_FORM: ItemFormValues = {
	behavior: 'STOCKED_ARTICLE',
	name: '',
	code: '',
	unit_of_measure_id: 0,
	item_category_id: null,
	description: ''
};

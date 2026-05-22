import { z } from 'zod';

/**
 * Internal Batch Form Validation Schema
 */
export const internalBatchSchema = z.object({
	name: z.string().min(1, 'El nombre del lote es requerido'),
	batch_type_id: z
		.number({ required_error: 'Debe seleccionar un tipo de lote' })
		.positive('Selección de tipo de lote inválida'),
	observaciones: z.string().optional().nullable(),
});

export interface InternalBatchFormValues {
	name?: string;
	batch_type_id?: number;
	observaciones?: string | null;
}

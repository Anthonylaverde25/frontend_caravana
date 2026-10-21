/** The 422 a movement answers when it would part mothers from their calves at foot. */
interface SeparationBody {
	code?: string;
	message?: string;
	errors?: Record<string, string[]>;
}

/** The message naming the pairs, when the error is a mother–calf separation; null otherwise. */
export function separationMessage(error: unknown): string | null {
	const body = (error as { response?: { data?: SeparationBody } })?.response?.data;

	if (body?.code !== 'MOTHER_CALF_SEPARATION') return null;

	return body.errors?.weaning_type?.[0] ?? body.message ?? 'Este movimiento separa crías de su madre.';
}

export const isSeparationError = (error: unknown): boolean => separationMessage(error) !== null;

/**
 * What the API answered to a refused save: field errors (422 validation) and the message of a
 * broken business rule (errors.domain).
 */
export interface ApiErrors {
	fields: Record<string, string>;
	domain: string | null;
}

export function readApiErrors(error: unknown, fallback = 'No se pudo guardar.'): ApiErrors {
	const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
	const fields: Record<string, string> = {};
	let domain: string | null = null;

	Object.entries(data?.errors ?? {}).forEach(([key, messages]) => {
		if (key === 'domain') {
			domain = messages[0] ?? null;
		} else {
			fields[key] = messages[0] ?? '';
		}
	});

	if (!domain && Object.keys(fields).length === 0) {
		domain = data?.message ?? fallback;
	}

	return { fields, domain };
}

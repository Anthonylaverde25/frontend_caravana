import type { DiagnosisFemale } from '@/features/gestation/hooks/useServiceOrders';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface TactoRowErrors {
  /** Message per female, painted on her row. */
  byFemale: Record<number, string>;
  /** What could not be tied to a row. */
  general: string | null;
}

/**
 * Ties the backend answer to the rows that caused it: a validation error names the index of the
 * diagnosis (`diagnoses.3.is_pregnant`); a domain error names the caravan in its message.
 */
export function tactoRowErrors(error: unknown, sentIds: number[], females: DiagnosisFemale[]): TactoRowErrors {
  const body: ApiErrorBody = (error as { response?: { data?: ApiErrorBody } } | null)?.response?.data ?? {};
  const byFemale: Record<number, string> = {};

  Object.entries(body.errors ?? {}).forEach(([key, messages]) => {
    const index = /^diagnoses\.(\d+)\./.exec(key)?.[1];
    const femaleId = index !== undefined ? sentIds[Number(index)] : undefined;
    if (femaleId !== undefined) byFemale[femaleId] = messages[0];
  });

  if (Object.keys(byFemale).length === 0 && body.message) {
    females
      .filter((female) => body.message!.includes(female.identification))
      .forEach((female) => (byFemale[female.female_caravan_id] = body.message!));
  }

  const general = Object.keys(byFemale).length === 0 ? (body.message ?? 'Error al registrar los diagnósticos.') : null;
  return { byFemale, general };
}

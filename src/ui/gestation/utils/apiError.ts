/** Body of an API error (422 domain errors carry a code and context). */
export interface ApiErrorData {
  message?: string;
  code?: string;
  pending_female_ids?: number[];
}

export function apiErrorData(error: unknown): ApiErrorData {
  const data = (error as { response?: { data?: ApiErrorData } } | null)?.response?.data;
  return data ?? {};
}

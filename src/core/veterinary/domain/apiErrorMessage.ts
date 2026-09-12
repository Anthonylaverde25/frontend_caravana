/**
 * Extracts the human readable message the API returns for a broken domain invariant (422),
 * without leaking `any` into every catch block.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  return typeof message === 'string' && message.trim() !== '' ? message : fallback;
}

export default apiErrorMessage;

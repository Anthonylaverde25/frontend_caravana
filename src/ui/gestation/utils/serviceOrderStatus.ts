/**
 * The stored status follows facts (semen S-B, DB1): a natural service ends when the torada leaves
 * (BULLS_WITHDRAWN), an AI one with SERVICE_ENDED. Both wait for the diagnosis.
 */
export function hasServiceEnded(status: string | null | undefined): boolean {
  const value = (status ?? '').toUpperCase();
  return value === 'BULLS_WITHDRAWN' || value === 'SERVICE_ENDED';
}

/** In service or waiting for its diagnosis: the order still has work in the tray. */
export function isOpenStatus(status: string | null | undefined): boolean {
  return (status ?? '').toUpperCase() === 'APPROVED' || hasServiceEnded(status);
}

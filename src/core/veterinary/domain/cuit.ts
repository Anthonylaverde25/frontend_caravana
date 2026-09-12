/**
 * The CUIT's módulo 11 check digit, the same arithmetic the backend applies.
 *
 * Duplicated on purpose rather than shared: it is a typo detector, and the point of having it here
 * is to catch the mistake while the person is still looking at the field, without a round trip.
 * The backend remains the authority — this never decides whether a value is stored.
 */
const WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function cuitDigits(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '');
}

export type CuitProblem = 'LENGTH' | 'CHECK_DIGIT' | null;

/**
 * What is wrong with these digits, or null when nothing is — including when the field is empty,
 * because an absent CUIT is not a malformed one (ADR-29: it groups, it does not certify).
 */
export function cuitProblem(raw: string | null | undefined): CuitProblem {
  const digits = cuitDigits(raw);

  if (digits.length === 0) return null;
  if (digits.length !== 11) return 'LENGTH';

  const sum = WEIGHTS.reduce((acc, weight, index) => acc + Number(digits[index]) * weight, 0);
  const remainder = sum % 11;
  const expected = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return Number(digits[10]) === expected ? null : 'CHECK_DIGIT';
}

/**
 * The digit these ten would need, so the message can say what was probably meant instead of only
 * that something is wrong.
 */
export function expectedCheckDigit(raw: string | null | undefined): number | null {
  const digits = cuitDigits(raw);

  if (digits.length !== 11) return null;

  const sum = WEIGHTS.reduce((acc, weight, index) => acc + Number(digits[index]) * weight, 0);
  const remainder = sum % 11;

  return remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;
}

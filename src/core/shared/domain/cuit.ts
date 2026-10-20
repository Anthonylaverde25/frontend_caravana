/**
 * The CUIT's módulo 11 check digit, the same arithmetic the backend applies (`Cuit.php`).
 *
 * Duplicated on purpose rather than shared: it is a typo detector, and the point of having it here
 * is to catch the mistake while the person is still looking at the field, without a round trip.
 * The backend remains the authority. Institutions only warn with it (ADR-43); a provider's CUIT is
 * a key and the backend refuses it.
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

  const expected = expectedCheckDigit(digits);

  return expected !== null && Number(digits[10]) === expected ? null : 'CHECK_DIGIT';
}

/**
 * The digit these ten would need, so the message can say what was probably meant instead of only
 * that something is wrong. Null without eleven digits, and also when the modulo 11 asks for a 10:
 * no CUIT is issued with those ten digits, so no last digit would fix it.
 */
export function expectedCheckDigit(raw: string | null | undefined): number | null {
  const digits = cuitDigits(raw);

  if (digits.length !== 11) return null;

  const sum = WEIGHTS.reduce((acc, weight, index) => acc + Number(digits[index]) * weight, 0);
  const result = 11 - (sum % 11);

  if (result === 11) return 0;
  if (result === 10) return null;

  return result;
}

/** Why this is not a valid CUIT, worded as the backend words it; null when it is (or is empty). */
export function cuitReason(raw: string | null | undefined): string | null {
  const problem = cuitProblem(raw);

  if (problem === 'LENGTH') return `El CUIT tiene 11 dígitos; se cargaron ${cuitDigits(raw).length}.`;
  if (problem === null) return null;

  const expected = expectedCheckDigit(raw);

  return expected === null
    ? 'No existe un CUIT con esos 10 primeros dígitos: revisá el número.'
    : `El dígito verificador no cierra: con esos 10 primeros dígitos el CUIT termina en ${expected}.`;
}

/** XX-XXXXXXXX-X for display; anything that is not eleven digits is shown as it came. */
export function formatCuit(raw: string | null | undefined): string {
  const digits = cuitDigits(raw);

  if (digits.length !== 11) return raw ?? '';

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

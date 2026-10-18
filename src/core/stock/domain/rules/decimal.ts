/**
 * Exact decimal arithmetic for the previews of the stock screens (amounts, VAT, conversions), over
 * BigInt scaled by 10^10. Only for showing: what is saved is computed again by the backend.
 */
export type Dec = bigint;

const SCALE = 10;
const ONE = 10n ** BigInt(SCALE);

/** Half-up division, away from zero, like the backend's bcround. */
function roundDiv(numerator: bigint, denominator: bigint): bigint {
	const negative = numerator < 0n !== denominator < 0n;
	const n = numerator < 0n ? -numerator : numerator;
	const d = denominator < 0n ? -denominator : denominator;
	const quotient = (n * 2n + d) / (d * 2n);
	return negative ? -quotient : quotient;
}

/**
 * Parses what an operator types or the API sends: "12000", "12.000,50" (es-AR) or "12000.5000".
 * Returns null for anything that is not a number.
 */
export function dec(value: string | number | null | undefined): Dec | null {
	if (value === null || value === undefined) return null;

	let text = String(value).trim();

	if (text === '') return null;

	if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');

	const match = /^(-)?(\d*)(?:\.(\d*))?$/.exec(text);

	if (!match || (match[2] === '' && (match[3] ?? '') === '')) return null;

	const fraction = (match[3] ?? '').padEnd(SCALE + 1, '0');
	const scaled = BigInt(match[2] || '0') * ONE + BigInt(fraction.slice(0, SCALE));
	const rounded = Number(fraction[SCALE]) >= 5 ? scaled + 1n : scaled;
	return match[1] ? -rounded : rounded;
}

export const ZERO: Dec = 0n;
export const add = (a: Dec, b: Dec): Dec => a + b;
export const sub = (a: Dec, b: Dec): Dec => a - b;
export const mul = (a: Dec, b: Dec): Dec => roundDiv(a * b, ONE);
export const div = (a: Dec, b: Dec): Dec | null => (b === 0n ? null : roundDiv(a * ONE, b));
export const sum = (values: Dec[]): Dec => values.reduce(add, ZERO);
export const isZero = (a: Dec): boolean => a === 0n;
export const isPositive = (a: Dec): boolean => a > 0n;
export const isNegative = (a: Dec): boolean => a < 0n;
/** A decimal text from the API that is above zero ("0.0000" and null are not). */
export const isPositiveText = (value: string | null | undefined): boolean => {
	const parsed = dec(value);
	return parsed !== null && parsed > 0n;
};

/** Rounded to a column's scale: round(1234.56789, 4) → 1234.5679. */
export function round(a: Dec, scale: number): Dec {
	const step = 10n ** BigInt(SCALE - scale);
	return roundDiv(a, step) * step;
}

/** "5000.0000": what the API expects for a column of that scale. */
export function toApi(a: Dec, scale: number): string {
	const rounded = round(a, scale);
	const negative = rounded < 0n;
	const abs = negative ? -rounded : rounded;
	const integer = abs / ONE;
	const fraction = (abs % ONE).toString().padStart(SCALE, '0').slice(0, scale);
	return `${negative ? '-' : ''}${integer}${scale > 0 ? `.${fraction}` : ''}`;
}

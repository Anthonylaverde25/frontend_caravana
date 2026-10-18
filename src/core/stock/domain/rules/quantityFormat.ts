import { type Dec, dec, isNegative, round, toApi } from './decimal';

/** "1234567" → "1.234.567" */
const group = (integer: string): string => integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function format(value: string | Dec | null | undefined, decimals: number, trimZeros: boolean): string {
	const parsed = typeof value === 'bigint' ? value : dec(value ?? null);
	if (parsed === null) return '—';
	const text = toApi(round(parsed, decimals), decimals);
	const negative = isNegative(parsed) && /[1-9]/.test(text);
	const [integer, fraction = ''] = text.replace('-', '').split('.');
	const shown = trimZeros ? fraction.replace(/0+$/, '') : fraction;
	return `${negative ? '−' : ''}${group(integer)}${shown ? `,${shown}` : ''}`;
}

/**
 * A quantity as the field reads it, without rounding what the paper said: "5000.0000" → "5.000",
 * "35.5000" → "35,5", with its unit when given ("5.000 ml").
 */
export function formatQuantity(value: string | Dec | null | undefined, symbol?: string | null): string {
	const text = format(value, 4, true);
	return symbol && text !== '—' ? `${text} ${symbol}` : text;
}

/** Money with two decimals: "180000.0000" → "$ 180.000,00". */
export function formatMoney(value: string | Dec | null | undefined): string {
	const text = format(value, 2, false);
	return text === '—' ? text : `$ ${text}`;
}

/** A unit cost keeps up to 6 decimals, trimmed: "24.000000" → "$ 24", "0.311080" → "$ 0,31108". */
export function formatUnitCost(value: string | Dec | null | undefined): string {
	const text = format(value, 6, true);
	return text === '—' ? text : `$ ${text}`;
}

/** "2026-10-01" or an ISO date-time → "01/10/2026". */
export function formatDate(value: string | null | undefined): string {
	if (!value) return '—';
	const [y, m, d] = value.slice(0, 10).split('-');
	return `${d}/${m}/${y}`;
}

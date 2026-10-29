export { formatDate, formatDateTime } from '@/ui/transfer-orders/components/transferOrderFormat';

const kgFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const moneyFormat = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });

export const formatKg = (value: number | null | undefined): string =>
	value == null ? '—' : `${kgFormat.format(value)} kg`;

export const formatMoney = (value: number | null | undefined): string =>
	value == null ? '—' : moneyFormat.format(value);

/** A typed number of a cell: empty is null, a comma is a decimal point. */
export const parseDecimal = (raw: string): number | null => {
	const clean = raw.replace(',', '.').trim();

	if (clean === '') return null;

	const value = Number(clean);

	return Number.isFinite(value) ? value : null;
};

/** E7: kg × $/kg when both are there, rounded like the server does. */
export const lineAmount = (weightKg: number | null, pricePerKg: number | null): number | null =>
	weightKg != null && pricePerKg != null ? Math.round(weightKg * pricePerKg * 100) / 100 : null;

export const localToday = (): string => {
	const now = new Date();

	return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

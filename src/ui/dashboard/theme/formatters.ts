const LOCALE = 'es-AR';

/** 1284 -> "1.284", 87.4 -> "87,4". */
export function formatNumber(value: number, decimals = 0): string {
	return value.toLocaleString(LOCALE, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
}

export function formatPercent(value: number, decimals = 1): string {
	return `${formatNumber(value, decimals)} %`;
}

/** Signed value with a real minus sign: +0,1 / −2,6. */
export function formatSigned(value: number, decimals = 1): string {
	const sign = value > 0 ? '+' : value < 0 ? '−' : '±';

	return `${sign}${formatNumber(Math.abs(value), decimals)}`;
}

/** Differences between percentages are percentage points, never percent. */
export function formatPp(value: number, decimals = 1): string {
	return `${formatSigned(value, decimals)} pp`;
}

/** Linear position of `value` inside [min, max] as a 0..100 percentage, clamped. */
export function toPercentOfRange(value: number, min: number, max: number): number {
	if (max === min) return 0;

	return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

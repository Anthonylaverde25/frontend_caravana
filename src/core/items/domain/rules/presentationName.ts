/** "Frasco × 500 ml": the name a presentation gets unless the operator writes another. */
export function suggestPresentationName(packaging: string, factor: number | null, symbol: string): string {
	const pack = packaging.trim();
	if (!pack || !factor || factor <= 0) {
		return pack;
	}
	return `${pack} × ${formatQuantity(factor)} ${symbol}`;
}

export function formatQuantity(value: number): string {
	return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(value);
}

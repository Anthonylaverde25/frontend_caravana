import { parseDecimal } from '../exitOrderFormat';
import type { ExitRow } from './exitRows';

/** How the sale was charged: the question is asked once for the load, not animal by animal. */
export type PricingMode = 'NONE' | 'PER_KG' | 'PER_CATEGORY' | 'PER_HEAD' | 'TOTAL';

/** Per kg: each animal's own kg, or the truck's total kg spread over the load. */
export type WeightSource = 'ANIMAL' | 'LOAD';

export interface ExitPricing {
	mode: PricingMode;
	pricePerKg: string;
	weightSource: WeightSource;
	loadKg: string;
	pricePerHead: string;
	total: string;
	/** Per kg by category: the $/kg of each category of the load, by its name. */
	categoryPrices: Record<string, string>;
}

export const EMPTY_PRICING: ExitPricing = {
	mode: 'PER_KG',
	pricePerKg: '',
	weightSource: 'ANIMAL',
	loadKg: '',
	pricePerHead: '',
	total: '',
	categoryPrices: {}
};

/** The key a category is priced and balanced by. */
export const categoryOf = (row: ExitRow): string => row.categoryName ?? 'Sin categoría';

export const PRICING_LABELS: Record<PricingMode, string> = {
	PER_KG: 'Por kg',
	PER_CATEGORY: 'Por kg según categoría',
	PER_HEAD: 'Por cabeza',
	TOTAL: 'Monto total',
	NONE: 'Sin precio todavía'
};

/** What one animal leaves with, once the pricing of the load is applied. */
export interface PricedLine {
	weightKg: number | null;
	/** The share of the truck's kg, not a weighing of the animal. */
	estimated: boolean;
	pricePerKg: number | null;
	amount: number | null;
}

const round = (value: number, decimals: number): number => {
	const factor = 10 ** decimals;

	return Math.round(value * factor) / factor;
};

/**
 * Spreads a total over the rows by their weights (or in equal parts when a weight is missing).
 * The last row takes the rounding, so the parts always add up to the total.
 */
export function spread(total: number, weights: (number | null)[], decimals: number): number[] {
	if (weights.length === 0) return [];

	const byWeight = weights.every((w) => w != null && w > 0);
	const basis = byWeight ? (weights as number[]) : weights.map(() => 1);
	const sum = basis.reduce((acc, w) => acc + w, 0);
	const parts = basis.map((w) => round((total * w) / sum, decimals));
	const drift = round(total - parts.reduce((acc, p) => acc + p, 0), decimals);
	parts[parts.length - 1] = round(parts[parts.length - 1] + drift, decimals);

	return parts;
}

/**
 * The weight, price and amount of each animal that leaves, by caravan id. Without a weight
 * declared, an issued order counts on the last one weighed: it is a plan, and it is marked so.
 */
export function priceRows(rows: ExitRow[], pricing: ExitPricing, lastWeightFallback = false): Map<number, PricedLine> {
	const leaving = rows.filter((row) => row.leaves);
	const loadKg = parseDecimal(pricing.loadKg);
	const fromLoad = pricing.mode === 'PER_KG' && pricing.weightSource === 'LOAD';
	const weights: (number | null)[] =
		fromLoad && loadKg != null && loadKg > 0
			? spread(
					loadKg,
					leaving.map((row) => row.lastWeight),
					1
				)
			: leaving.map((row) => (fromLoad ? null : parseDecimal(row.weight)));
	const fromLast = leaving.map(
		(row, index) => lastWeightFallback && weights[index] == null && row.lastWeight != null
	);
	leaving.forEach((row, index) => {
		if (fromLast[index]) weights[index] = row.lastWeight;
	});

	const pricePerKg = parseDecimal(pricing.pricePerKg);
	const perHead = parseDecimal(pricing.pricePerHead);
	const total = parseDecimal(pricing.total);
	const totals = pricing.mode === 'TOTAL' && total != null ? spread(total, weights, 2) : [];

	return new Map(
		leaving.map((row, index) => {
			const weightKg = weights[index];
			const kgPrice =
				pricing.mode === 'PER_KG'
					? pricePerKg
					: pricing.mode === 'PER_CATEGORY'
						? parseDecimal(pricing.categoryPrices[categoryOf(row)] ?? '')
						: null;
			const amount =
				pricing.mode === 'PER_KG' || pricing.mode === 'PER_CATEGORY'
					? weightKg != null && kgPrice != null
						? round(weightKg * kgPrice, 2)
						: null
					: pricing.mode === 'PER_HEAD'
						? perHead
						: pricing.mode === 'TOTAL'
							? (totals[index] ?? null)
							: null;

			return [
				row.caravanId,
				{
					weightKg,
					estimated: (fromLoad || fromLast[index]) && weightKg != null,
					pricePerKg: kgPrice,
					amount
				}
			];
		})
	);
}

/** Whether the pricing chosen still lacks the number it needs: said, never blocking. */
export function pricingGap(pricing: ExitPricing, missingCategories = 0): string | null {
	if (pricing.mode === 'PER_KG' && !pricing.pricePerKg.trim()) return 'Falta el precio por kg.';

	if (pricing.mode === 'PER_KG' && pricing.weightSource === 'LOAD' && !pricing.loadKg.trim())
		return 'Faltan los kg totales del camión.';

	if (pricing.mode === 'PER_HEAD' && !pricing.pricePerHead.trim()) return 'Falta el precio por cabeza.';

	if (pricing.mode === 'PER_CATEGORY' && missingCategories > 0)
		return `Falta el $/kg de ${missingCategories} categoría(s).`;

	if (pricing.mode === 'TOTAL' && !pricing.total.trim()) return 'Falta el monto total.';

	return null;
}

/** What a category of the load weighs and is worth: the balance of the movement. */
export interface CategoryBalance {
	category: string;
	heads: number;
	weightKg: number;
	/** Some kg are estimated: the truck's total spread, or the last weighing of an issued order. */
	estimated: boolean;
	amount: number;
	/** The $/kg of the category when one applies to all of it. */
	pricePerKg: number | null;
}

/** The animals that leave, by category, in the order the categories first appear. */
export function balanceByCategory(rows: ExitRow[], priced: Map<number, PricedLine>): CategoryBalance[] {
	const groups = new Map<string, CategoryBalance & { prices: Set<number | null> }>();

	rows.filter((row) => row.leaves).forEach((row) => {
		const key = categoryOf(row);
		const line = priced.get(row.caravanId);
		const group = groups.get(key) ?? {
			category: key,
			heads: 0,
			weightKg: 0,
			estimated: false,
			amount: 0,
			pricePerKg: null,
			prices: new Set<number | null>()
		};
		group.heads += 1;
		group.weightKg += line?.weightKg ?? 0;
		group.estimated ||= !!line?.estimated;
		group.amount += line?.amount ?? 0;
		group.prices.add(line?.pricePerKg ?? null);
		groups.set(key, group);
	});

	return [...groups.values()].map(({ prices, ...group }) => ({
		...group,
		pricePerKg: prices.size === 1 ? ([...prices][0] ?? null) : null
	}));
}

/**
 * The pricing an order already carries: the $/kg agreed at issue on its lines. One price for all
 * is "Por kg"; one per category is "Por kg según categoría"; none leaves the load to say it.
 */
export function pricingOfLines(
	lines: { price_per_kg: number | null; category: { name: string | null } | null }[]
): ExitPricing | null {
	const priced = lines.filter((line) => line.price_per_kg != null);

	if (priced.length === 0) return null;

	const distinct = new Set(priced.map((line) => line.price_per_kg));

	if (distinct.size === 1 && priced.length === lines.length)
		return { ...EMPTY_PRICING, mode: 'PER_KG', pricePerKg: String(priced[0].price_per_kg) };

	const categoryPrices: Record<string, string> = {};
	priced.forEach((line) => {
		const key = line.category?.name ?? 'Sin categoría';
		categoryPrices[key] ??= String(line.price_per_kg);
	});

	return { ...EMPTY_PRICING, mode: 'PER_CATEGORY', categoryPrices };
}

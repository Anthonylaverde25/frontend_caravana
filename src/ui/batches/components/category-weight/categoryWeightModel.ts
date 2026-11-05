import type { BatchCategoryWeightPoint } from '@/core/batches/domain/entities/BatchOverview';

export interface CategoryCurve {
	key: string;
	categoryId: number | null;
	name: string;
	headCount: number;
	color: string;
	/** Oldest first. */
	points: BatchCategoryWeightPoint[];
}

/** Validated with the dataviz palette script, light against #fcfcfb and dark against #1a1a19. */
const SERIES_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6'];
const SERIES_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9'];
const NO_CATEGORY_COLOR = '#8a8984';

/** A category keeps its color in every batch and whatever else is on the chart. */
export function categoryColor(categoryId: number | null, dark: boolean): string {
	if (categoryId === null) return NO_CATEGORY_COLOR;

	const series = dark ? SERIES_DARK : SERIES_LIGHT;

	return series[(categoryId - 1) % series.length];
}

/** Read as a local day: as UTC, a date prints as the day before west of Greenwich. */
export const dayToTime = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00`).getTime();

export const formatDay = (date: string) => {
	const [year, month, day] = date.slice(0, 10).split('-');

	return `${day}/${month}/${year}`;
};

export const formatWeight = (value: number, digits = 1) => value.toLocaleString('es-AR', { maximumFractionDigits: digits });

/** One curve per category, heaviest first: the order of the lines on the chart, top to bottom. */
export function buildCategoryCurves(points: BatchCategoryWeightPoint[], dark: boolean): CategoryCurve[] {
	const curves = new Map<string, CategoryCurve>();

	points.forEach((point) => {
		const key = String(point.category_id ?? 'none');
		const curve = curves.get(key) ?? {
			key,
			categoryId: point.category_id,
			name: point.category_name ?? 'Sin categoría',
			headCount: point.head_count,
			color: categoryColor(point.category_id, dark),
			points: []
		};

		curve.points.push(point);
		curves.set(key, curve);
	});

	const lastWeight = (curve: CategoryCurve) => curve.points[curve.points.length - 1].average_weight;

	return [...curves.values()].sort((a, b) => lastWeight(b) - lastWeight(a));
}

/** Every day any category was weighed, oldest first. */
export const weighingDays = (points: BatchCategoryWeightPoint[]) =>
	[...new Set(points.map((point) => point.weighing_date))].sort();

/** Where a category stood on a day: its point of that day or, if not weighed then, its last one. */
export function pointAsOf(curve: CategoryCurve, day: string): BatchCategoryWeightPoint | null {
	return [...curve.points].reverse().find((point) => point.weighing_date <= day) ?? null;
}

/** The kilos of the animals weighed so far on a day: mass adds up where averages do not. */
export function massAsOf(curves: CategoryCurve[], day: string): number {
	return curves.reduce((sum, curve) => {
		const point = pointAsOf(curve, day);

		return point ? sum + point.average_weight * point.weighed_count : sum;
	}, 0);
}

/**
 * Whether a curve has a stretch between weighings of a different number of animals. There the line
 * moves because the set changed, not because anybody gained or lost weight, so it is drawn dashed.
 */
export const hasChangedWeighedCount = (curves: CategoryCurve[]) =>
	curves.some((curve) =>
		curve.points.some((point, index) => index > 0 && curve.points[index - 1].weighed_count !== point.weighed_count)
	);

import { ActivityBatch } from '@/core/activities/domain/entities/Activity';

export interface TransferableCaravan {
	id: number;
	identification: string;
	sex?: 'M' | 'H' | null;
	current_weight?: number | null;
	category_name?: string | null;
	category?: string | null;
	batch_id?: number | null;
}

/** Head, kilos and average of a batch at a given moment. */
export interface BatchFigures {
	count: number;
	/** Measured mass over the weighed animals. */
	kg: number;
	/** How many of those head carry a weight. An average is only over these. */
	weighed: number;
	/** Null when nothing was weighed: an average of nothing is undefined, not zero. */
	average: number | null;
}

const averageOf = (kg: number, weighed: number): number | null => (weighed > 0 ? kg / weighed : null);

/** What leaves the source batch with this selection. */
export function figuresOfSelection(caravans: TransferableCaravan[], selectedIds: number[]): BatchFigures {
	const selected = new Set(selectedIds);
	let kg = 0;
	let weighed = 0;

	caravans.forEach((caravan) => {
		if (!selected.has(caravan.id)) return;

		if (caravan.current_weight != null) {
			kg += Number(caravan.current_weight);
			weighed += 1;
		}
	});

	return { count: selectedIds.length, kg, weighed, average: averageOf(kg, weighed) };
}

/** The batch as it stands today. */
export function figuresOfBatch(
	batch: Pick<ActivityBatch, 'count' | 'total_weight' | 'weighed_count' | 'current_weight'> | null | undefined
): BatchFigures {
	if (!batch) return { count: 0, kg: 0, weighed: 0, average: null };

	const kg = Number(batch.total_weight ?? 0);
	const weighed = Number(batch.weighed_count ?? 0);

	return {
		count: batch.count ?? 0,
		kg,
		weighed,
		// The sheet already publishes the average; recomputing it here would make the
		// same number disagree with itself on two screens over a rounding rule.
		average: batch.current_weight != null ? Number(batch.current_weight) : averageOf(kg, weighed)
	};
}

/** The same figures, read off the animals themselves. */
export function figuresOfCaravans(caravans: TransferableCaravan[]): BatchFigures {
	let kg = 0;
	let weighed = 0;

	caravans.forEach((caravan) => {
		if (caravan.current_weight == null) return;

		kg += Number(caravan.current_weight);
		weighed += 1;
	});

	return { count: caravans.length, kg, weighed, average: averageOf(kg, weighed) };
}

/**
 * The batch as it stands today, from whichever source actually has the numbers.
 *
 * The production sheet publishes the average but not always the mass behind it, and a
 * batch showing 178,4 kg/cab with no total would leave this screen saying the transfer
 * moves 0 kg. When the sheet is silent the animals answer: their weights are already
 * loaded here to be selected.
 */
export function resolveBatchFigures(
	batch: Pick<ActivityBatch, 'count' | 'total_weight' | 'weighed_count' | 'current_weight'> | null | undefined,
	caravans: TransferableCaravan[]
): BatchFigures {
	const published = figuresOfBatch(batch);

	if (published.kg > 0 || caravans.length === 0) return published;

	const derived = figuresOfCaravans(caravans);

	return {
		count: published.count || derived.count,
		kg: derived.kg,
		weighed: derived.weighed,
		average: published.average ?? derived.average
	};
}

/** The source batch once the selected animals have left. */
export function afterLeaving(before: BatchFigures, moved: BatchFigures): BatchFigures {
	const kg = Math.max(0, before.kg - moved.kg);
	const weighed = Math.max(0, before.weighed - moved.weighed);

	return {
		count: Math.max(0, before.count - moved.count),
		kg,
		weighed,
		average: averageOf(kg, weighed)
	};
}

/** The destination once the animals arrive. A brand new batch starts from nothing. */
export function afterArriving(before: BatchFigures | null, moved: BatchFigures): BatchFigures {
	const base = before ?? { count: 0, kg: 0, weighed: 0, average: null };
	const kg = base.kg + moved.kg;
	const weighed = base.weighed + moved.weighed;

	return {
		count: base.count + moved.count,
		kg,
		weighed,
		average: averageOf(kg, weighed)
	};
}

const integer = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatKg = (kg: number | null | undefined): string => (kg == null ? '—' : integer.format(Math.round(kg)));

export const formatAverage = (average: number | null | undefined): string =>
	average == null ? '—' : decimal.format(average);

/** Signed difference between two averages, for the "sube / baja" line. */
export function averageDelta(before: number | null, after: number | null): number | null {
	if (before == null || after == null) return null;

	return after - before;
}

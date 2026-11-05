import type { WeightRecord } from '../BatchWeightChart';
import { sortWeightRecords } from '../batchWeightChartOptions';
import { CategoryCurve, formatDay, formatWeight } from './categoryWeightModel';

export interface WeighingHistoryLine {
	key: string;
	name: string;
	color: string;
	cover: string;
	value: string;
}

export interface WeighingHistoryRow {
	key: string;
	date: string;
	label: string;
	/** A weighing: the kilos on the scale that day. A movement weighs nothing and says what happened. */
	kilos: string | null;
	note: string | null;
	lines: WeighingHistoryLine[];
	/** The day to mark on the chart; none for a movement. */
	day: string | null;
}

function movementNote(record: WeightRecord, previous: WeightRecord | undefined): string {
	const verb = record.type === 'MOVEMENT_IN' ? 'Entraron' : 'Salieron';

	if (record.caravans_count == null || previous?.caravans_count == null) return `${verb} animales`;

	const moved = Math.abs(record.caravans_count - previous.caravans_count);

	return moved === 1 ? `${verb === 'Entraron' ? 'Entró' : 'Salió'} 1 cabeza` : `${verb} ${moved} cabezas`;
}

/**
 * What was measured, newest first: each day with its kilos and the average of each category weighed,
 * for the animals that are in the batch today (the same reading as the chart beside it). Animals
 * moving in or out go in their own row, without kilos, since nothing was weighed.
 */
export function buildWeighingHistory(
	curves: CategoryCurve[],
	days: string[],
	records: WeightRecord[]
): WeighingHistoryRow[] {
	const weighings = days.map<WeighingHistoryRow>((day) => {
		const weighed = curves
			.map((curve) => ({ curve, point: curve.points.find((candidate) => candidate.weighing_date === day) }))
			.filter((row) => row.point !== undefined)
			.sort((a, b) => b.point!.average_weight - a.point!.average_weight);

		return {
			key: `day-${day}`,
			date: day,
			label: formatDay(day),
			kilos: `${formatWeight(
				weighed.reduce((sum, { point }) => sum + point!.average_weight * point!.weighed_count, 0),
				0
			)} kg`,
			note: null,
			day,
			lines: weighed.map(({ curve, point }) => ({
				key: curve.key,
				name: curve.name,
				color: curve.color,
				cover: `${point!.weighed_count} de ${point!.head_count}`,
				value: formatWeight(point!.average_weight)
			}))
		};
	});

	const sorted = sortWeightRecords(records);
	const movements = sorted.flatMap<WeighingHistoryRow>((record, index) =>
		record.type === 'MOVEMENT_IN' || record.type === 'MOVEMENT_OUT'
			? [
					{
						key: `movement-${record.id}`,
						date: record.weighing_date.slice(0, 10),
						label: formatDay(record.weighing_date),
						kilos: null,
						note: movementNote(record, sorted[index - 1]),
						lines: [],
						day: null
					}
				]
			: []
	);

	// On a shared date the movement goes first: it is the closing point of that day.
	return [...movements, ...weighings].sort((a, b) => b.date.localeCompare(a.date));
}

import type { Batch } from '@/core/batches/domain/entities/Batch';

export interface HerdKpis {
	heads: number;
	/** Batches that hold head. */
	stockedBatches: number;
	activeBatches: number;
	emptyBatches: number;
	serviceHeads: number;
	serviceCodes: string[];
	/** Calves at foot inside `heads`: born into their mother's batch, counted apart from the adults. */
	calves: number;
	/** Mean weight of the weighed adults (calves at foot left out); null when none was weighed. */
	averageKg: number | null;
	weighedHeads: number;
	/** Mean weight of the weighed calves at foot; null when none was weighed. */
	calfAverageKg: number | null;
}

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

/**
 * KPIs of the visible batches. The average weight is weighted by the head behind each batch average:
 * a plain mean of batch averages would let 8 bulls weigh as much as 212 steers. Calves at foot come
 * out of it: a breeding batch averaging cows with their 35 kg calves describes neither.
 */
export function computeHerdKpis(batches: Batch[]): HerdKpis {
	let heads = 0;
	let stockedBatches = 0;
	let activeBatches = 0;
	let emptyBatches = 0;
	let serviceHeads = 0;
	const serviceCodes: string[] = [];
	let calves = 0;
	let weightSum = 0;
	let weighedHeads = 0;
	let calfWeightSum = 0;
	let calfWeighedHeads = 0;

	batches.forEach((batch) => {
		const batchHeads = batch.head_count;
		heads += batchHeads;
		calves += batch.nursing_count;

		if (batchHeads > 0) stockedBatches += 1;
		else emptyBatches += 1;

		if (batch.is_active) activeBatches += 1;

		if (batch.active_service_order) {
			serviceHeads += batchHeads;
			serviceCodes.push(batch.active_service_order.code);
		}

		if (batch.current_weight && batch.current_weight > 0) {
			// The batch average stands for its weighed head; without that count, for all its head.
			const behind = batch.weighed_count ?? batchHeads;
			// Only a known weighed set can have its calves taken out; the batch aggregates include them.
			const calfHeads = batch.weighed_count !== null ? batch.nursing_weighed_count : 0;
			const calfKg = calfHeads > 0 ? batch.nursing_total_weight : 0;
			weightSum += Math.max(0, batch.current_weight * behind - calfKg);
			weighedHeads += Math.max(0, behind - calfHeads);
			calfWeightSum += calfKg;
			calfWeighedHeads += calfHeads;
		}
	});

	return {
		heads,
		stockedBatches,
		activeBatches,
		emptyBatches,
		serviceHeads,
		serviceCodes,
		calves,
		averageKg: weighedHeads > 0 ? oneDecimal(weightSum / weighedHeads) : null,
		weighedHeads,
		calfAverageKg: calfWeighedHeads > 0 ? oneDecimal(calfWeightSum / calfWeighedHeads) : null
	};
}

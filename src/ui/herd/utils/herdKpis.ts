import type { Batch } from '@/core/batches/domain/entities/Batch';

export interface HerdKpis {
	heads: number;
	/** Batches that hold head. */
	stockedBatches: number;
	activeBatches: number;
	emptyBatches: number;
	serviceHeads: number;
	serviceCodes: string[];
	/** Head-weighted mean of the batch averages; null when no batch was weighed. */
	averageKg: number | null;
	weighedHeads: number;
}

/**
 * KPIs of the visible batches. The average weight is weighted by the head behind each batch average:
 * a plain mean of batch averages would let 8 bulls weigh as much as 212 steers.
 */
export function computeHerdKpis(batches: Batch[]): HerdKpis {
	let heads = 0;
	let stockedBatches = 0;
	let activeBatches = 0;
	let emptyBatches = 0;
	let serviceHeads = 0;
	const serviceCodes: string[] = [];
	let weightSum = 0;
	let weighedHeads = 0;

	batches.forEach((batch) => {
		const batchHeads = batch.head_count;
		heads += batchHeads;

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
			weightSum += batch.current_weight * behind;
			weighedHeads += behind;
		}
	});

	return {
		heads,
		stockedBatches,
		activeBatches,
		emptyBatches,
		serviceHeads,
		serviceCodes,
		averageKg: weighedHeads > 0 ? Math.round(weightSum / weighedHeads) : null,
		weighedHeads
	};
}

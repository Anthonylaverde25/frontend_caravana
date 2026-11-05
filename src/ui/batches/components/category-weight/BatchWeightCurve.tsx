import { hasMixedWeights } from '@/ui/herd/utils/herdFormat';
import { BatchWeightChart, WeightRecord } from '../BatchWeightChart';
import { BatchCategoryWeightChart } from './BatchCategoryWeightChart';

interface BatchWeightCurveProps {
	batch: { id?: number | string | null; weighed_category_count?: number | null };
	history: WeightRecord[];
	height?: number | string;
}

/** The curve a batch can honestly draw: one line per category when its weights span several. */
export function BatchWeightCurve({ batch, history, height }: BatchWeightCurveProps) {
	return hasMixedWeights(batch) ? (
		<BatchCategoryWeightChart batchId={Number(batch.id)} height={height} />
	) : (
		<BatchWeightChart data={history} height={height} />
	);
}

export default BatchWeightCurve;

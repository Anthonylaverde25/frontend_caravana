import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';

const batchRepository = new ApiBatchRepository();

/** The curve of each category of a mixed batch. Refreshed with the batch curve after a weighing. */
export function useBatchCategoryWeightSeries(batchId: number | undefined) {
	return useQuery({
		queryKey: ['batch-weight-history', batchId, 'by-category'],
		queryFn: () => batchRepository.getCategoryWeightSeries(batchId!),
		enabled: !!batchId
	});
}

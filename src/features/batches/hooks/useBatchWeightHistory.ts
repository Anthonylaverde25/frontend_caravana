import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';

const batchRepository = new ApiBatchRepository();

export function useBatchWeightHistory(batchId: number | undefined) {
    return useQuery({
        queryKey: ['batch-weight-history', batchId],
        queryFn: () => batchRepository.getWeightHistory(batchId!),
        enabled: !!batchId,
    });
}

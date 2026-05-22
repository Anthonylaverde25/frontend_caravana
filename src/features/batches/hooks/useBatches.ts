import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { ListBatchesUseCase } from '@/core/batches/application/use-cases/ListBatchesUseCase';

const batchRepository = new ApiBatchRepository();
const listBatchesUseCase = new ListBatchesUseCase(batchRepository);

export function useBatches(farmId?: number, batchType?: string) {
  return useQuery({
    queryKey: ['batches', farmId, batchType],
    queryFn: () => listBatchesUseCase.execute(farmId, batchType),
  });
}

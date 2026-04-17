import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { ListBatchesUseCase } from '@/core/batches/application/use-cases/ListBatchesUseCase';

const batchRepository = new ApiBatchRepository();
const listBatchesUseCase = new ListBatchesUseCase(batchRepository);

export function useBatches(farmId?: number) {
  return useQuery({
    queryKey: ['batches', farmId],
    queryFn: () => listBatchesUseCase.execute(farmId),
  });
}

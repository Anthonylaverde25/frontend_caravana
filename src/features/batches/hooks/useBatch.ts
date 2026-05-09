import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { GetBatchUseCase } from '@/core/batches/application/use-cases/GetBatchUseCase';

const batchRepository = new ApiBatchRepository();
const getBatchUseCase = new GetBatchUseCase(batchRepository);

export function useBatch(id?: number) {
  return useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatchUseCase.execute(id!),
    enabled: !!id,
  });
}

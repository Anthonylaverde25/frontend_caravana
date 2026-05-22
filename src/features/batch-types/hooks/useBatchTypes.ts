import { useQuery } from '@tanstack/react-query';
import { ApiBatchTypeRepository } from '@/core/batch-types/infrastructure/repositories/ApiBatchTypeRepository';
import { ListBatchTypesUseCase } from '@/core/batch-types/application/use-cases/ListBatchTypesUseCase';

const batchTypeRepository = new ApiBatchTypeRepository();
const listBatchTypesUseCase = new ListBatchTypesUseCase(batchTypeRepository);

export function useBatchTypes() {
  return useQuery({
    queryKey: ['batch-types'],
    queryFn: () => listBatchTypesUseCase.execute(),
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

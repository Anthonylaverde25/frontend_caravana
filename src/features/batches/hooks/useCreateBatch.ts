import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { CreateBatchUseCase } from '@/core/batches/application/use-cases/CreateBatchUseCase';
import { CreateBatchRequest } from '@/core/batches/domain/entities/Batch';

const batchRepository = new ApiBatchRepository();
const createBatchUseCase = new CreateBatchUseCase(batchRepository);

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBatchRequest) => createBatchUseCase.execute(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { CreateServiceBatchUseCase } from '@/core/batches/application/use-cases/CreateServiceBatchUseCase';
import { CreateServiceBatchRequest } from '@/core/batches/domain/entities/Batch';

const batchRepository = new ApiBatchRepository();
const createServiceBatchUseCase = new CreateServiceBatchUseCase(batchRepository);

export function useCreateServiceBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateServiceBatchRequest) => createServiceBatchUseCase.execute(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['gestation'] });
    },
  });
}

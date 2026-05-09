import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { BulkCreateCaravansUseCase } from '@/core/caravans/application/use-cases/BulkCreateCaravansUseCase';
import { CreateCaravanRequest } from '@/core/caravans/domain/entities/Caravan';

const caravanRepository = new ApiCaravanRepository();
const bulkCreateCaravansUseCase = new BulkCreateCaravansUseCase(caravanRepository);

export function useBulkCreateCaravans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caravans: CreateCaravanRequest[]) => bulkCreateCaravansUseCase.execute(caravans),
    onSuccess: () => {
      // Invalidate both caravans and movements to reflect the mass update
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  });
}

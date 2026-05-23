import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { BulkRegisterBirthUseCase } from '@/core/caravans/application/use-cases/BulkRegisterBirthUseCase';
import { RegisterBirthDTO } from '@/core/caravans/domain/entities/Caravan';

const caravanRepository = new ApiCaravanRepository();
const bulkRegisterBirthUseCase = new BulkRegisterBirthUseCase(caravanRepository);

export function useBulkRegisterBirth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (births: RegisterBirthDTO[]) => bulkRegisterBirthUseCase.execute(births),
    onSuccess: () => {
      // Invalidate caravans, movements and all batch related data to reflect the births
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

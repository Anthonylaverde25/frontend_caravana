import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateFarmUseCase } from '@/core/suppliers/application/use-cases/CreateFarmUseCase';
import { ApiFarmRepository } from '@/core/suppliers/infrastructure/repositories/ApiFarmRepository';
import { Farm } from '@/core/suppliers/domain/entities/Farm';

/**
 * Hook to create a new farm and associate it with a provider.
 * Follows the 'one hook per action' pattern.
 */
export const useCreateFarm = () => {
  const queryClient = useQueryClient();
  const repository = new ApiFarmRepository();
  const createFarmUseCase = new CreateFarmUseCase(repository);

  return useMutation({
    mutationFn: (farmData: Partial<Farm>) => createFarmUseCase.execute(farmData),
    onSuccess: () => {
      // Invalidate both suppliers and farms lists to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['farms', 'list'] });
    },
  });
};

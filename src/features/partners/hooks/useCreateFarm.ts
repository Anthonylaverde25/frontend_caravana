import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateFarmUseCase } from '@/core/partners/application/use-cases/CreateFarmUseCase';
import { ApiFarmRepository } from '@/core/partners/infrastructure/repositories/ApiFarmRepository';
import { Farm } from '@/core/partners/domain/entities/Farm';

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
      // Invalidate both partners and farms lists to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ['partners', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['farms', 'list'] });
    },
  });
};

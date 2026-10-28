import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePartnerUseCase } from '@/core/partners/application/use-cases/CreatePartnerUseCase';
import { ApiPartnerRepository } from '@/core/partners/infrastructure/repositories/ApiPartnerRepository';
import { CreatePartnerInput } from '@/core/partners/domain/repositories/IPartnerRepository';

/**
 * Hook to create a new partner.
 * Refreshes the partners list after a successful creation.
 * Follows the 'one hook per action' pattern.
 */
export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const createPartnerUseCase = new CreatePartnerUseCase(new ApiPartnerRepository());

  return useMutation({
    mutationFn: (input: CreatePartnerInput) => createPartnerUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', 'list'] });
    },
  });
};

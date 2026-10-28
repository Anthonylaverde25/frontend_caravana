import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdatePartnerUseCase } from '@/core/partners/application/use-cases/UpdatePartnerUseCase';
import { ApiPartnerRepository } from '@/core/partners/infrastructure/repositories/ApiPartnerRepository';
import { PartnerIdentity } from '@/core/partners/domain/repositories/IPartnerRepository';

/**
 * Corrects a partner's identity. Refreshes every partner list, whatever role it filters by.
 */
export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const updatePartnerUseCase = new UpdatePartnerUseCase(new ApiPartnerRepository());

  return useMutation({
    mutationFn: ({ id, identity }: { id: number; identity: PartnerIdentity }) => updatePartnerUseCase.execute(id, identity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
};

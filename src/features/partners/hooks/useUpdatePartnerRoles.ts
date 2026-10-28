import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiPartnerRepository } from '@/core/partners/infrastructure/repositories/ApiPartnerRepository';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';

/**
 * Changes what a partner sells or buys. Refreshes every partner list, whatever role it filters by.
 */
export const useUpdatePartnerRoles = () => {
  const queryClient = useQueryClient();
  const repository = new ApiPartnerRepository();

  return useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: PartnerRole[] }) => repository.updateRoles(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
};

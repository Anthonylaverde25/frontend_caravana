import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiSupplierRepository } from '@/core/suppliers/infrastructure/repositories/ApiSupplierRepository';

interface SupplierRoles {
  supplies_livestock: boolean;
  supplies_items: boolean;
}

/**
 * Changes what a provider sells. Refreshes every provider list, whatever role it filters by.
 */
export const useUpdateSupplierRoles = () => {
  const queryClient = useQueryClient();
  const repository = new ApiSupplierRepository();

  return useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: SupplierRoles }) => repository.updateRoles(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

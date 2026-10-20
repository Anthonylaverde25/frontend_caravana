import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateSupplierUseCase } from '@/core/suppliers/application/use-cases/UpdateSupplierUseCase';
import { ApiSupplierRepository } from '@/core/suppliers/infrastructure/repositories/ApiSupplierRepository';
import { Supplier, SupplierDTO } from '@/core/suppliers/domain/entities/Supplier';

type SupplierChanges = Pick<SupplierDTO, 'name' | 'commercial_name' | 'cuit' | 'location' | 'email' | 'phone'>;

/**
 * Corrects a provider's data. Refreshes every provider list, whatever role it filters by.
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const updateSupplierUseCase = new UpdateSupplierUseCase(new ApiSupplierRepository());

  return useMutation({
    mutationFn: ({ current, changes }: { current: Supplier; changes: SupplierChanges }) =>
      updateSupplierUseCase.execute(current, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

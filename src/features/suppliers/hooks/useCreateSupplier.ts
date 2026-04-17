import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSupplierUseCase } from '@/core/suppliers/application/use-cases/CreateSupplierUseCase';
import { ApiSupplierRepository } from '@/core/suppliers/infrastructure/repositories/ApiSupplierRepository';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

/**
 * Hook to create a new supplier.
 * Refreshes the suppliers list after a successful creation.
 * Follows the 'one hook per action' pattern.
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const repository = new ApiSupplierRepository();
  const createSupplierUseCase = new CreateSupplierUseCase(repository);

  return useMutation({
    mutationFn: (supplierData: Partial<Supplier>) => createSupplierUseCase.execute(supplierData),
    onSuccess: () => {
      // Invalidar la lista de proveedores para forzar un refresco
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] });
    },
  });
};

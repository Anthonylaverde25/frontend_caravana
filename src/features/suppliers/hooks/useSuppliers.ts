import { useQuery } from '@tanstack/react-query';
import { ListSuppliersUseCase } from '@/core/suppliers/application/use-cases/ListSuppliersUseCase';
import { ApiSupplierRepository } from '@/core/suppliers/infrastructure/repositories/ApiSupplierRepository';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

/**
 * Hook to manage the suppliers list data using React Query.
 * Integrates Clean Architecture layers: Hook -> UseCase -> Repository.
 */
export const useSuppliers = () => {
  const repository = new ApiSupplierRepository();
  const listSuppliersUseCase = new ListSuppliersUseCase(repository);

  return useQuery<Supplier[]>({
    queryKey: ['suppliers', 'list'],
    queryFn: () => listSuppliersUseCase.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutos de validez de caché
  });
};

export const useSupplier = (id: number | null | undefined) => {
  const repository = new ApiSupplierRepository();

  return useQuery<Supplier | null>({
    queryKey: ['suppliers', id],
    queryFn: () => (id ? repository.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

import { useQuery } from '@tanstack/react-query';
import { ListPartnersUseCase } from '@/core/partners/application/use-cases/ListPartnersUseCase';
import { ApiPartnerRepository } from '@/core/partners/infrastructure/repositories/ApiPartnerRepository';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { PartnerFilter } from '@/core/partners/domain/entities/PartnerRole';

/**
 * Hook to manage the partners list data using React Query.
 * Integrates Clean Architecture layers: Hook -> UseCase -> Repository.
 * The filter narrows the list to a role or a group (C3); omitted, it lists every partner.
 */
export const usePartners = (filter?: PartnerFilter) => {
  const repository = new ApiPartnerRepository();
  const listPartnersUseCase = new ListPartnersUseCase(repository);

  return useQuery<Partner[]>({
    queryKey: ['partners', 'list', filter ?? 'all'],
    queryFn: () => listPartnersUseCase.execute(filter),
    staleTime: 1000 * 60 * 5, // 5 minutos de validez de caché
  });
};

export const usePartner = (id: number | null | undefined) => {
  const repository = new ApiPartnerRepository();

  return useQuery<Partner | null>({
    queryKey: ['partners', id],
    queryFn: () => (id ? repository.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

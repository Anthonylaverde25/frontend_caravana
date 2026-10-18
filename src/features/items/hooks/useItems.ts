import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { FindItemUseCase, SearchItemsUseCase } from '@/core/items/application/use-cases/ItemUseCases';
import { ApiItemRepository } from '@/core/items/infrastructure/repositories/ApiItemRepository';
import { Item, ItemDetail, ItemFilters } from '@/core/items/domain/entities/Item';

/** Every catalog key carries the company: the catalog of one company is never shown in another (H1). */
export const itemKeys = {
	all: (companyId: number | null) => ['items', companyId] as const,
	list: (companyId: number | null, filters: ItemFilters) => ['items', companyId, 'list', filters] as const,
	detail: (companyId: number | null, id: number) => ['items', companyId, 'detail', id] as const
};

export const useItems = (filters: ItemFilters) => {
	const { activeCompanyId } = useCompany();
	const useCase = new SearchItemsUseCase(new ApiItemRepository());

	return useQuery<Item[]>({
		queryKey: itemKeys.list(activeCompanyId, filters),
		queryFn: () => useCase.execute(filters),
		enabled: !!activeCompanyId,
		staleTime: 1000 * 60
	});
};

export const useItem = (id: number | null) => {
	const { activeCompanyId } = useCompany();
	const useCase = new FindItemUseCase(new ApiItemRepository());

	return useQuery<ItemDetail>({
		queryKey: itemKeys.detail(activeCompanyId, id ?? 0),
		queryFn: () => useCase.execute(id as number),
		enabled: !!activeCompanyId && !!id,
		staleTime: 1000 * 60,
		retry: false
	});
};

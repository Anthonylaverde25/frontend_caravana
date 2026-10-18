import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	ListItemCategoriesUseCase,
	SaveItemCategoryUseCase,
	SetItemCategoryActiveUseCase
} from '@/core/items/application/use-cases/ItemCategoryUseCases';
import { ApiItemCategoryRepository } from '@/core/items/infrastructure/repositories/ApiItemCategoryRepository';
import { ItemCategory } from '@/core/items/domain/entities/ItemCategory';
import { ItemCategoryPayload } from '@/core/items/domain/repositories/IItemCategoryRepository';
import { itemKeys } from './useItems';

export const useItemCategories = (includeInactive = false) => {
	const { activeCompanyId } = useCompany();
	const useCase = new ListItemCategoriesUseCase(new ApiItemCategoryRepository());

	return useQuery<ItemCategory[]>({
		queryKey: ['item-categories', activeCompanyId, includeInactive],
		queryFn: () => useCase.execute(includeInactive),
		enabled: !!activeCompanyId,
		staleTime: 1000 * 60 * 10
	});
};

/** A category's name shows in the item list (its path), so both caches refresh. */
const useInvalidateCategories = () => {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return () => {
		queryClient.invalidateQueries({ queryKey: ['item-categories', activeCompanyId] });
		queryClient.invalidateQueries({ queryKey: itemKeys.all(activeCompanyId) });
	};
};

export const useSaveItemCategory = () => {
	const invalidate = useInvalidateCategories();
	const useCase = new SaveItemCategoryUseCase(new ApiItemCategoryRepository());

	return useMutation({
		mutationFn: ({ payload, id }: { payload: ItemCategoryPayload; id?: number }) => useCase.execute(payload, id),
		onSuccess: invalidate
	});
};

export const useSetItemCategoryActive = () => {
	const invalidate = useInvalidateCategories();
	const useCase = new SetItemCategoryActiveUseCase(new ApiItemCategoryRepository());

	return useMutation({
		mutationFn: ({ id, active }: { id: number; active: boolean }) => useCase.execute(id, active),
		onSuccess: invalidate
	});
};

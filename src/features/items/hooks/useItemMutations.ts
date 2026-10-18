import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	SaveItemPresentationUseCase,
	SaveItemUseCase,
	SetItemActiveUseCase,
	SetItemPresentationActiveUseCase,
	SyncItemProvidersUseCase
} from '@/core/items/application/use-cases/ItemUseCases';
import { ApiItemRepository } from '@/core/items/infrastructure/repositories/ApiItemRepository';
import { ItemPayload } from '@/core/items/domain/entities/Item';
import { ProviderLinkPayload } from '@/core/items/domain/repositories/IItemRepository';
import { itemKeys } from './useItems';

/** Every item mutation refreshes the company's catalog (list and file). */
const useInvalidateItems = () => {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return () => queryClient.invalidateQueries({ queryKey: itemKeys.all(activeCompanyId) });
};

export const useSaveItem = () => {
	const invalidate = useInvalidateItems();
	const useCase = new SaveItemUseCase(new ApiItemRepository());

	return useMutation({
		mutationFn: ({ payload, id }: { payload: ItemPayload; id?: number }) => useCase.execute(payload, id),
		onSuccess: invalidate
	});
};

export const useSetItemActive = () => {
	const invalidate = useInvalidateItems();
	const useCase = new SetItemActiveUseCase(new ApiItemRepository());

	return useMutation({
		mutationFn: ({ id, active }: { id: number; active: boolean }) => useCase.execute(id, active),
		onSuccess: invalidate
	});
};

export const useSaveItemPresentation = () => {
	const invalidate = useInvalidateItems();
	const useCase = new SaveItemPresentationUseCase(new ApiItemRepository());

	return useMutation({
		mutationFn: (v: { itemId: number; name: string; factor: number; presentationId?: number }) =>
			useCase.execute(v.itemId, v.name, v.factor, v.presentationId),
		onSuccess: invalidate
	});
};

export const useSetItemPresentationActive = () => {
	const invalidate = useInvalidateItems();
	const useCase = new SetItemPresentationActiveUseCase(new ApiItemRepository());

	return useMutation({
		mutationFn: (v: { itemId: number; presentationId: number; active: boolean }) => useCase.execute(v.itemId, v.presentationId, v.active),
		onSuccess: invalidate
	});
};

export const useSyncItemProviders = () => {
	const invalidate = useInvalidateItems();
	const useCase = new SyncItemProvidersUseCase(new ApiItemRepository());

	return useMutation({
		mutationFn: ({ itemId, links }: { itemId: number; links: ProviderLinkPayload[] }) => useCase.execute(itemId, links),
		onSuccess: invalidate
	});
};

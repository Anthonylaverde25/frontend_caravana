import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { GetItemKardexUseCase, GetItemStockUseCase, SetCriticalStockUseCase } from '@/core/stock/application/use-cases/StockUseCases';
import { KardexFilters } from '@/core/stock/domain/entities/ItemStock';
import { ApiItemStockRepository } from '@/core/stock/infrastructure/repositories/ApiItemStockRepository';
import { stockKeys } from './stockKeys';

const repository = new ApiItemStockRepository();

export const useItemStock = (itemId: number | null) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.itemStock(activeCompanyId, itemId ?? 0),
		queryFn: () => new GetItemStockUseCase(repository).execute(itemId as number),
		enabled: !!activeCompanyId && !!itemId
	});
};

export const useItemKardex = (itemId: number | null, filters: KardexFilters) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.kardex(activeCompanyId, itemId ?? 0, filters),
		queryFn: () => new GetItemKardexUseCase(repository).execute(itemId as number, filters),
		enabled: !!activeCompanyId && !!itemId,
		placeholderData: keepPreviousData
	});
};

export const useSetCriticalStock = () => {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return useMutation({
		mutationFn: (v: { itemId: number; warehouseId: number; level: string | null }) =>
			new SetCriticalStockUseCase(repository).execute(v.itemId, v.warehouseId, v.level),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', activeCompanyId] })
	});
};

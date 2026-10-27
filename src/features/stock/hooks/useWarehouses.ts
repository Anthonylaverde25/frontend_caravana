import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { ListWarehousesUseCase, SaveWarehouseUseCase, SetDefaultWarehouseUseCase, SetWarehouseActiveUseCase } from '@/core/stock/application/use-cases/StockUseCases';
import { Warehouse, WarehouseKind } from '@/core/stock/domain/entities/ItemStock';
import { ApiItemStockRepository } from '@/core/stock/infrastructure/repositories/ApiItemStockRepository';
import { stockKeys } from './stockKeys';

const repository = new ApiItemStockRepository();

export const useWarehouses = () => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.warehouses(activeCompanyId),
		queryFn: () => new ListWarehousesUseCase(repository).execute(),
		enabled: !!activeCompanyId
	});
};

export const useNextWarehouseCode = (enabled: boolean) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: [...stockKeys.warehouses(activeCompanyId), 'next-code'],
		queryFn: () => repository.nextWarehouseCode(),
		enabled: !!activeCompanyId && enabled,
		staleTime: 0
	});
};

/**
 * Changing a warehouse touches the list and every balance shown by warehouse. Default and active
 * answer with the whole list, which replaces the cache at once: never two defaults on screen.
 */
function useWarehouseMutation<V, R extends Warehouse | Warehouse[]>(run: (v: V) => Promise<R>) {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return useMutation({
		mutationFn: run,
		onSuccess: (result) => {
			if (Array.isArray(result)) queryClient.setQueryData(stockKeys.warehouses(activeCompanyId), result);
			return Promise.all([
				queryClient.invalidateQueries({ queryKey: stockKeys.warehouses(activeCompanyId) }),
				queryClient.invalidateQueries({ queryKey: ['items', activeCompanyId] })
			]);
		}
	});
}

export const useSaveWarehouse = () =>
	useWarehouseMutation((v: { id: number | null; code: string; name: string; kind: WarehouseKind }) =>
		new SaveWarehouseUseCase(repository).execute(v.id, v.code, v.name, v.kind)
	);

export const useSetDefaultWarehouse = () => useWarehouseMutation((id: number) => new SetDefaultWarehouseUseCase(repository).execute(id));

export const useSetWarehouseActive = () =>
	useWarehouseMutation((v: { id: number; active: boolean; newDefaultId?: number | null }) =>
		new SetWarehouseActiveUseCase(repository).execute(v.id, v.active, v.newDefaultId ?? null)
	);

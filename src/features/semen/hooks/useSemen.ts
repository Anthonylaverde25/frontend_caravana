import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	GetSemenInventoryUseCase,
	GetSemenLotUseCase,
	IdentifySemenLotUseCase,
	ListSemenLotsUseCase,
	ListSemenSiresUseCase,
	ListSemenUnidentifiedUseCase,
	RegisterSemenReceiptUseCase,
	SaveSemenSireUseCase,
	UpdateSemenProfileUseCase
} from '@/core/semen/application/use-cases/SemenUseCases';
import { SemenLotSharePayload, SemenProfilePayload, SemenReceiptPayload, SemenSirePayload } from '@/core/semen/domain/entities/Semen';
import { SemenInventoryFilters } from '@/core/semen/domain/repositories/ISemenRepository';
import { ApiSemenRepository } from '@/core/semen/infrastructure/repositories/ApiSemenRepository';
import { useInvalidateStock } from '@/features/stock/hooks/useInvalidateStock';
import { semenKeys } from './semenKeys';

const repository = new ApiSemenRepository();

export const useSemenSires = (includeInactive = false) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: [...semenKeys.sires(activeCompanyId), includeInactive],
		queryFn: () => new ListSemenSiresUseCase(repository).execute(undefined, includeInactive),
		enabled: !!activeCompanyId
	});
};

export const useSaveSemenSire = () => {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return useMutation({
		mutationFn: (v: { id: number | null; payload: SemenSirePayload }) => new SaveSemenSireUseCase(repository).execute(v.id, v.payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: semenKeys.sires(activeCompanyId) })
	});
};

export const useSemenInventory = (filters: SemenInventoryFilters) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: semenKeys.inventory(activeCompanyId, filters),
		queryFn: () => new GetSemenInventoryUseCase(repository).execute(filters),
		enabled: !!activeCompanyId
	});
};

/** Lots of an item with their balance in one tank; idle until both are known. */
export const useSemenLots = (itemId: number | null, warehouseId: number | null) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: semenKeys.lots(activeCompanyId, itemId ?? 0, warehouseId ?? 0),
		queryFn: () => new ListSemenLotsUseCase(repository).execute(itemId as number, warehouseId as number),
		enabled: !!activeCompanyId && !!itemId && !!warehouseId
	});
};

export const useSemenLot = (id: number | null) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: semenKeys.lot(activeCompanyId, id ?? 0),
		queryFn: () => new GetSemenLotUseCase(repository).execute(id as number),
		enabled: !!activeCompanyId && !!id
	});
};

export const useSemenUnidentified = (itemId?: number, warehouseId?: number, enabled = true) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: semenKeys.unidentified(activeCompanyId, itemId, warehouseId),
		queryFn: () => new ListSemenUnidentifiedUseCase(repository).execute(itemId, warehouseId),
		enabled: !!activeCompanyId && enabled
	});
};

/** Registering an entry or identifying straws moves stock: refresh everything stock shows. */
export const useRegisterSemenReceipt = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (payload: SemenReceiptPayload) => new RegisterSemenReceiptUseCase(repository).execute(payload),
		onSuccess: () => invalidate()
	});
};

export const useIdentifySemenLot = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (v: { entryId: number; lots: SemenLotSharePayload[] }) => new IdentifySemenLotUseCase(repository).execute(v.entryId, v.lots),
		onSuccess: () => invalidate()
	});
};

export const useUpdateSemenProfile = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (v: { itemId: number; payload: SemenProfilePayload }) => new UpdateSemenProfileUseCase(repository).execute(v.itemId, v.payload),
		onSuccess: () => invalidate()
	});
};

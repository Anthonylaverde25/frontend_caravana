import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	ListUnitsOfMeasureUseCase,
	SaveUnitOfMeasureUseCase,
	SetUnitOfMeasureActiveUseCase
} from '@/core/items/application/use-cases/UnitOfMeasureUseCases';
import { ApiUnitOfMeasureRepository } from '@/core/items/infrastructure/repositories/ApiUnitOfMeasureRepository';
import { UnitOfMeasure } from '@/core/items/domain/entities/UnitOfMeasure';
import { UnitOfMeasurePayload } from '@/core/items/domain/repositories/IUnitOfMeasureRepository';
import { itemKeys } from './useItems';

export const useUnitsOfMeasure = (includeInactive = false) => {
	const { activeCompanyId } = useCompany();
	const useCase = new ListUnitsOfMeasureUseCase(new ApiUnitOfMeasureRepository());

	return useQuery<UnitOfMeasure[]>({
		queryKey: ['units-of-measure', activeCompanyId, includeInactive],
		queryFn: () => useCase.execute(includeInactive),
		enabled: !!activeCompanyId,
		staleTime: 1000 * 60 * 10
	});
};

/** A unit's name and symbol show in the item list too, so both caches refresh. */
const useInvalidateUnits = () => {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return () => {
		queryClient.invalidateQueries({ queryKey: ['units-of-measure', activeCompanyId] });
		queryClient.invalidateQueries({ queryKey: itemKeys.all(activeCompanyId) });
	};
};

export const useSaveUnitOfMeasure = () => {
	const invalidate = useInvalidateUnits();
	const useCase = new SaveUnitOfMeasureUseCase(new ApiUnitOfMeasureRepository());

	return useMutation({
		mutationFn: ({ payload, id }: { payload: Partial<UnitOfMeasurePayload>; id?: number }) => useCase.execute(payload, id),
		onSuccess: invalidate
	});
};

export const useSetUnitOfMeasureActive = () => {
	const invalidate = useInvalidateUnits();
	const useCase = new SetUnitOfMeasureActiveUseCase(new ApiUnitOfMeasureRepository());

	return useMutation({
		mutationFn: ({ id, active }: { id: number; active: boolean }) => useCase.execute(id, active),
		onSuccess: invalidate
	});
};

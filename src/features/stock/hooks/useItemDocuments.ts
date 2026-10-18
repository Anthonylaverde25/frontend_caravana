import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	FindItemDocumentUseCase,
	RegisterInitialStockUseCase,
	ReverseItemDocumentUseCase,
	SearchItemDocumentsUseCase
} from '@/core/stock/application/use-cases/StockUseCases';
import { InitialStockPayload, ItemDocumentFilters } from '@/core/stock/domain/entities/ItemDocument';
import { ApiItemDocumentRepository } from '@/core/stock/infrastructure/repositories/ApiItemDocumentRepository';
import { stockKeys } from './stockKeys';
import { useInvalidateStock } from './useInvalidateStock';

const repository = new ApiItemDocumentRepository();

export const useItemDocuments = (filters: ItemDocumentFilters) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.documentList(activeCompanyId, filters),
		queryFn: () => new SearchItemDocumentsUseCase(repository).execute(filters),
		enabled: !!activeCompanyId,
		placeholderData: keepPreviousData
	});
};

export const useItemDocument = (id: number | null) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.document(activeCompanyId, id ?? 0),
		queryFn: () => new FindItemDocumentUseCase(repository).execute(id as number),
		enabled: !!activeCompanyId && !!id,
		retry: false
	});
};

export const useRegisterInitialStock = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (payload: InitialStockPayload) => new RegisterInitialStockUseCase(repository).execute(payload),
		onSuccess: invalidate
	});
};

export const useReverseItemDocument = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (v: { id: number; reason: string; idempotencyKey: string }) =>
			new ReverseItemDocumentUseCase(repository).execute(v.id, v.reason, v.idempotencyKey),
		onSuccess: invalidate
	});
};

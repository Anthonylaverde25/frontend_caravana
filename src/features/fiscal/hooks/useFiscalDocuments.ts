import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	FindFiscalDocumentUseCase,
	GetFiscalCatalogUseCase,
	RegisterFiscalDocumentUseCase,
	SearchFiscalDocumentsUseCase,
	VoidFiscalDocumentUseCase
} from '@/core/fiscal/application/use-cases/FiscalDocumentUseCases';
import { FiscalDocumentFilters, FiscalDocumentPayload } from '@/core/fiscal/domain/entities/FiscalDocument';
import { ApiFiscalCatalogRepository, ApiFiscalDocumentRepository } from '@/core/fiscal/infrastructure/repositories/ApiFiscalDocumentRepository';
import { stockKeys } from '@/features/stock/hooks/stockKeys';
import { useInvalidateStock } from '@/features/stock/hooks/useInvalidateStock';

const repository = new ApiFiscalDocumentRepository();

/** Document types and taxes: a fixed catalog of the tenant, read once (DS15). */
export const useFiscalCatalog = () =>
	useQuery({
		queryKey: stockKeys.fiscalCatalog(),
		queryFn: () => new GetFiscalCatalogUseCase(new ApiFiscalCatalogRepository()).execute(),
		staleTime: Infinity
	});

export const useFiscalDocuments = (filters: FiscalDocumentFilters) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.fiscalList(activeCompanyId, filters),
		queryFn: () => new SearchFiscalDocumentsUseCase(repository).execute(filters),
		enabled: !!activeCompanyId,
		placeholderData: keepPreviousData
	});
};

export const useFiscalDocument = (id: number | null) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.fiscalDetail(activeCompanyId, id ?? 0),
		queryFn: () => new FindFiscalDocumentUseCase(repository).execute(id as number),
		enabled: !!activeCompanyId && !!id,
		retry: false
	});
};

export const useRegisterFiscalDocument = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (payload: FiscalDocumentPayload) => new RegisterFiscalDocumentUseCase(repository).execute(payload),
		onSuccess: invalidate
	});
};

export const useVoidFiscalDocument = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (v: { id: number; reason: string }) => new VoidFiscalDocumentUseCase(repository).execute(v.id, v.reason),
		onSuccess: invalidate
	});
};

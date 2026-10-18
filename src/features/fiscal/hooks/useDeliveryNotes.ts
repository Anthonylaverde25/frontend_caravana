import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	BuildInvoiceDraftUseCase,
	ListFiscalDiscrepanciesUseCase,
	ListPendingDeliveryNotesUseCase,
	ResolveFiscalDiscrepancyUseCase
} from '@/core/fiscal/application/use-cases/DeliveryNoteUseCases';
import { DiscrepancyFilters } from '@/core/fiscal/domain/entities/DeliveryNote';
import { ApiDeliveryNoteRepository } from '@/core/fiscal/infrastructure/repositories/ApiDeliveryNoteRepository';
import { stockKeys } from '@/features/stock/hooks/stockKeys';

const repository = new ApiDeliveryNoteRepository();

/** Delivery notes without invoice; with a provider, only theirs (the notice of DC9). */
export const usePendingDeliveryNotes = (providerId?: number | null, enabled = true) => {
	const { activeCompanyId } = useCompany();
	const provider = providerId ?? undefined;

	return useQuery({
		queryKey: stockKeys.pendingDeliveryNotes(activeCompanyId, provider),
		queryFn: () => new ListPendingDeliveryNotesUseCase(repository).execute(provider),
		enabled: !!activeCompanyId && enabled
	});
};

export const useInvoiceDraft = (ids: number[]) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.invoiceDraft(activeCompanyId, ids),
		queryFn: () => new BuildInvoiceDraftUseCase(repository).execute(ids),
		enabled: !!activeCompanyId && ids.length > 0,
		retry: false,
		staleTime: Infinity
	});
};

export const useFiscalDiscrepancies = (filters: DiscrepancyFilters, enabled = true) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: stockKeys.discrepancies(activeCompanyId, filters),
		queryFn: () => new ListFiscalDiscrepanciesUseCase(repository).execute(filters),
		enabled: !!activeCompanyId && enabled
	});
};

export const useResolveDiscrepancy = () => {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return useMutation({
		mutationFn: (v: { id: number; resolution: string }) =>
			new ResolveFiscalDiscrepancyUseCase(repository).execute(v.id, v.resolution),
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ['fiscal-discrepancies', activeCompanyId] }),
				queryClient.invalidateQueries({ queryKey: stockKeys.fiscalDocuments(activeCompanyId) })
			])
	});
};

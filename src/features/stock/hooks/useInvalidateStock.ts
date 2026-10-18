import { useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { stockKeys } from './stockKeys';

/**
 * After registering or voiding anything: documents, operations, the catalog with its balances, notices,
 * batch histories, pending delivery notes and their discrepancies.
 */
export function useInvalidateStock() {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: stockKeys.fiscalDocuments(activeCompanyId) }),
			queryClient.invalidateQueries({ queryKey: stockKeys.documents(activeCompanyId) }),
			queryClient.invalidateQueries({ queryKey: ['items', activeCompanyId] }),
			queryClient.invalidateQueries({ queryKey: stockKeys.incidents(activeCompanyId) }),
			queryClient.invalidateQueries({ queryKey: ['batches', activeCompanyId, 'consumption-history'] }),
			// Only the tray: the draft of a conversion just registered would answer that its notes are invoiced.
			queryClient.invalidateQueries({ queryKey: ['delivery-notes', activeCompanyId, 'pending'] }),
			queryClient.invalidateQueries({ queryKey: ['fiscal-discrepancies', activeCompanyId] })
		]);
}

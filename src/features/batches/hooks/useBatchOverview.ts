import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { useCompany } from '@/contexts/CompanyContext';

const batchRepository = new ApiBatchRepository();

/**
 * Composition, reproductive state and alerts of a batch, for its detail page.
 */
export function useBatchOverview(batchId?: number) {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: ['batches', 'overview', activeCompanyId, batchId],
		queryFn: () => batchRepository.getOverview(batchId!),
		enabled: !!batchId && activeCompanyId != null
	});
}

import { useQuery } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { CaravanSummarySort } from '@/core/caravans/domain/entities/CaravanSummary';
import { useCompany } from '@/contexts/CompanyContext';

const caravanRepository = new ApiCaravanRepository();

export interface UseCaravansSummaryOptions {
	batchId?: number | string;
	scope?: 'own' | 'external' | 'all';
	search?: string;
	sex?: 'M' | 'H' | 'ALL';
	sort?: CaravanSummarySort;
	page?: number;
	perPage?: number;
	/** Lets a collapsed row hold the query until it is opened. */
	enabled?: boolean;
}

export function useCaravansSummary(options: UseCaravansSummaryOptions = {}) {
	const { activeCompanyId } = useCompany();
	const {
		batchId,
		scope = 'own',
		search = '',
		sex = 'ALL',
		sort = 'identification',
		page = 1,
		perPage = 25,
		enabled = true
	} = options;

	return useQuery({
		queryKey: ['caravans', 'summary', activeCompanyId, scope, batchId, search, sex, sort, page, perPage],
		queryFn: () =>
			caravanRepository.findSummary({
				companyId: activeCompanyId || undefined,
				scope,
				batchId,
				search: search.trim() || undefined,
				sex: sex === 'ALL' ? undefined : sex,
				sort,
				page,
				perPage
			}),
		enabled: enabled && activeCompanyId != null,
		staleTime: 1000 * 60 * 2, // 2 minutes
		placeholderData: (previousData) => previousData
	});
}

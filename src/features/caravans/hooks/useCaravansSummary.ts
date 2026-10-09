import { useQuery } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { useCompany } from '@/contexts/CompanyContext';

const caravanRepository = new ApiCaravanRepository();

export interface UseCaravansSummaryOptions {
  batchId?: number | string;
  scope?: 'own' | 'external' | 'all';
  search?: string;
  sex?: 'M' | 'H' | 'ALL';
  page?: number;
  perPage?: number;
}

export function useCaravansSummary(options: UseCaravansSummaryOptions = {}) {
  const { activeCompanyId } = useCompany();
  const {
    batchId,
    scope = 'own',
    search = '',
    sex = 'ALL',
    page = 1,
    perPage = 25,
  } = options;

  return useQuery({
    queryKey: ['caravans-summary', activeCompanyId, scope, batchId, search, sex, page, perPage],
    queryFn: () =>
      caravanRepository.findSummary({
        companyId: activeCompanyId || undefined,
        scope,
        batchId,
        search: search.trim() || undefined,
        sex: sex === 'ALL' ? undefined : sex,
        page,
        perPage,
      }),
    enabled: activeCompanyId != null,
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
}

import { useQuery } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { ListCaravansUseCase } from '@/core/caravans/application/use-cases/ListCaravansUseCase';

const caravanRepository = new ApiCaravanRepository();
const listCaravansUseCase = new ListCaravansUseCase(caravanRepository);

/**
 * useCaravans
 *
 * Fetches all caravans for the currently active company.
 *
 * The `companyId` is included in the `queryKey` so that React Query
 * automatically refetches when the active company changes in CompanyContext.
 * The actual filtering is handled server-side via the X-Company-ID header
 * (set globally by CompanyContext → axiosInstance).
 *
 * @param companyId - The active company ID from useCompany(). Pass null to disable the query.
 */
export function useCaravans(companyId: number | null | undefined) {
  return useQuery({
    queryKey: ['caravans', companyId],
    queryFn: () => listCaravansUseCase.execute(companyId || undefined),
    enabled: companyId != null,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

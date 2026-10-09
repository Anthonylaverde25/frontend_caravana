import { useQuery } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';

const caravanRepository = new ApiCaravanRepository();

export function useCaravanDetail(caravanId: number | null | undefined) {
  return useQuery({
    queryKey: ['caravan-detail', caravanId],
    queryFn: () => (caravanId ? caravanRepository.findById(caravanId) : null),
    enabled: !!caravanId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

import { useQuery } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';

const caravanRepository = new ApiCaravanRepository();

export function useCaravanWeights(caravanId: number | undefined) {
  return useQuery({
    queryKey: ['caravan-weights', caravanId],
    queryFn: () => caravanRepository.getWeights(caravanId!),
    enabled: !!caravanId,
  });
}

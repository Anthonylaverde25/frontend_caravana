import { useQuery } from '@tanstack/react-query';
import { ApiCaravanMovementRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanMovementRepository';

const movementRepository = new ApiCaravanMovementRepository();

/**
 * Hook to fetch the movement history (traceability) for a specific caravan.
 * 
 * @param caravanId - The ID of the caravan.
 */
export function useCaravanMovements(caravanId: number | null) {
  return useQuery({
    queryKey: ['caravans', caravanId, 'movements'],
    queryFn: () => caravanId ? movementRepository.findByCaravanId(caravanId) : Promise.resolve([]),
    enabled: !!caravanId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

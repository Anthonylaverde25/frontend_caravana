import { useQuery } from '@tanstack/react-query';
import { ApiCaravanMovementRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanMovementRepository';
import useSession from '@/hooks/useSession';

const movementRepository = new ApiCaravanMovementRepository();

/**
 * Hook to fetch the movement history (traceability) for a specific caravan.
 * 
 * @param caravanId - The ID of the caravan.
 */
export function useCaravanMovements(caravanId: number | null) {
  const { activeCompanyId } = useSession();

  return useQuery({
    queryKey: ['caravans', activeCompanyId, caravanId, 'movements'],
    queryFn: () => caravanId ? movementRepository.findByCaravanId(caravanId) : Promise.resolve([]),
    enabled: !!caravanId && !!activeCompanyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch the entire movement history for all caravans (Audit view).
 */
export function useAllCaravanMovements() {
  const { activeCompanyId } = useSession();

  return useQuery({
    queryKey: ['caravans', activeCompanyId, 'movements', 'all'],
    queryFn: () => movementRepository.findAll(),
    enabled: !!activeCompanyId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

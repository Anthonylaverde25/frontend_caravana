import { useQuery } from '@tanstack/react-query';
import { preServiceRepository } from '@/core/pre-service/infrastructure/repositories/ApiPreServiceRepository';
import { BullClinicalHistoryResponse } from '@/core/pre-service/domain/BullClinicalHistory';

/**
 * Hook to fetch the full veterinary clinical history and andrological evolution of a bull.
 */
export function useBullClinicalHistory(caravanId: number | null | undefined) {
  return useQuery<BullClinicalHistoryResponse>({
    queryKey: ['bull-clinical-history', caravanId],
    queryFn: async () => {
      if (!caravanId) {
        throw new Error('Caravan ID is required');
      }
      return preServiceRepository.getBullClinicalHistory(caravanId);
    },
    enabled: Boolean(caravanId),
  });
}

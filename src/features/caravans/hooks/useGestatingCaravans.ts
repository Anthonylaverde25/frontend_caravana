import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { CaravanMapper } from '@/core/caravans/infrastructure/mappers/CaravanMapper';

/**
 * useGestatingCaravans
 *
 * Fetches gestating caravans for a specific batch.
 *
 * @param batchId - The ID of the batch to fetch gestating caravans for.
 */
export function useGestatingCaravans(batchId: number | null | undefined) {
  return useQuery({
    queryKey: ['gestating-caravans', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const response = await axiosInstance.get<any[]>(`/batches/${batchId}/gestating-caravans`);
      return response.data.map(CaravanMapper.toDomain);
    },
    enabled: batchId != null && !isNaN(batchId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

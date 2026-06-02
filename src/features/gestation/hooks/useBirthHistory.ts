import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

export interface BirthHistoryRecord {
  gestation_id: number;
  mother_id: number;
  mother_identification: string;
  birth_date: string;
  notes: string | null;
  calf_id: number;
  calf_identification: string;
  is_nursing: boolean;
  calf_sex: string | null;
  calf_batch_name: string | null;
}

/**
 * useBirthHistory
 *
 * Hook to fetch the calving and weaning history of the current tenant company.
 */
export function useBirthHistory() {
  return useQuery<BirthHistoryRecord[]>({
    queryKey: ['births-history'],
    queryFn: async () => {
      const response = await axiosInstance.get('/caravans/births-history');
      return response.data;
    }
  });
}

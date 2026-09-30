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
  calf_batch_id: number | null;
  /** The calf's current C/S: the reference a new one is chosen against. */
  calf_category_id: number | null;
  calf_subcategory_id: number | null;
  mother_batch_id: number | null;
  mother_batch_name: string | null;
  /** The open order — of weaning or of transfer — that already holds this calf. */
  open_order_code: string | null;
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

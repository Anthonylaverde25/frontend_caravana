import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

export interface PendingSireItem {
  calf_id: number;
  calf_identification: string;
  calf_sex: string | null;
  birth_date: string;
  days_without_sire: number;
  mother_id: number;
  mother_identification: string;
  gestation_id: number | null;
  batch_name: string | null;
  batch_id: number | null;
  candidate_sires: { id: number; identification: string; is_confirmed: boolean }[];
}

export function usePendingSires() {
  return useQuery<PendingSireItem[]>({
    queryKey: ['pending-sires'],
    queryFn: async () => {
      const response = await axiosInstance.get<PendingSireItem[]>('/caravans/pending-sires');
      return response.data;
    },
    refetchOnWindowFocus: true,
    staleTime: 60_000,
  });
}

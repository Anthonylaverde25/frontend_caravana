import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

export type SireIdentificationMethod = 'operational' | 'phenotype' | 'lab_genetic';

export interface PaternityCandidate {
  id: number;
  identification: string;
  joined_at: string | null;
  retired_at: string | null;
  /** Whether his stay crossed the estimated conception; null when his stay is unknown. */
  compatible_by_date: boolean | null;
}

export interface PendingPaternity {
  calf_id: number;
  calf_identification: string | null;
  calf_sex: string | null;
  birth_date: string;
  mother_id: number;
  mother_identification: string | null;
  batch_id: number | null;
  batch_name: string | null;
  gestation_id: number | null;
  service_order_id: number | null;
  service_order_code: string | null;
  conception_window: { from: string; to: string };
  candidates: PaternityCandidate[];
  days_pending: number;
}

export const paternityKeys = {
  pending: ['paternity', 'pending'] as const,
};

/** Calves born without a confirmed sire, with their candidate sires ("Paternidad pendiente"). */
export function usePendingPaternities() {
  return useQuery<PendingPaternity[]>({
    queryKey: paternityKeys.pending,
    queryFn: async () => (await axiosInstance.get('/paternity/pending')).data,
  });
}

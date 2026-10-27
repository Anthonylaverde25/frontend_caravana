import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { paternityKeys, type SireIdentificationMethod } from './usePendingPaternities';

export interface PaternityConfirmation {
  calf_id: number;
  father_id: number;
  method: SireIdentificationMethod;
  notes: string | null;
}

export interface ConfirmPaternitiesResult {
  confirmed: number;
  warnings: { calf_id: number; message: string }[];
}

/** Confirms the sire of several calves at once: all or none. */
export function useConfirmPaternities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (confirmations: PaternityConfirmation[]): Promise<ConfirmPaternitiesResult> =>
      (await axiosInstance.post('/paternity/confirmations', { confirmations })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paternityKeys.pending });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['births-history'] });
    },
  });
}

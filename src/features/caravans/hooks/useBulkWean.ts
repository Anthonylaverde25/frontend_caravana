import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';
import { WeanCaravanPayload } from './useWeanCaravan';

export interface NewBatchDraft {
  name: string;
  farm_id?: number | null;
  activity_id?: number | null;
  batch_type_id?: number | null;
}

export interface BulkWeanInput {
  weanings: WeanCaravanPayload[];
  newBatch?: NewBatchDraft | null;
}

/**
 * useBulkWean
 *
 * Hook to record bulk weaning for multiple calves.
 * Sends a POST request to /caravans/bulk-wean with atomic new_batch support.
 */
export function useBulkWean() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WeanCaravanPayload[] | BulkWeanInput) => {
      const payload: BulkWeanInput = Array.isArray(input) ? { weanings: input } : input;
      const response = await axiosInstance.post('/caravans/bulk-wean', {
        new_batch: payload.newBatch
          ? {
              name: payload.newBatch.name,
              farm_id: payload.newBatch.farm_id ?? null,
              activity_id: payload.newBatch.activity_id ?? null,
              batch_type_id: payload.newBatch.batch_type_id ?? null,
            }
          : undefined,
        weanings: payload.weanings.map((w) => ({
          caravan_id: w.caravanId,
          target_batch_id: w.targetBatchId || undefined,
          weaning_date: w.weaningDate,
          weaning_weight: w.weaningWeight,
          new_category: w.newCategory || null,
          notes: w.notes || null,
        })),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['births-history'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Destete masivo registrado correctamente');
    },
    onError: (error: any) => {
      console.error('Error in useBulkWean:', error);
      const msg = error.response?.data?.message || 'Error al procesar el destete masivo';
      toast.error(msg);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';
import { WeanCaravanPayload } from './useWeanCaravan';

/**
 * useBulkWean
 *
 * Hook to record bulk weaning for multiple calves.
 * Sends a POST request to /caravans/bulk-wean.
 */
export function useBulkWean() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weanings: WeanCaravanPayload[]) => {
      const response = await axiosInstance.post('/caravans/bulk-wean', {
        weanings: weanings.map(w => ({
          caravan_id: w.caravanId,
          target_batch_id: w.targetBatchId,
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
      toast.success('Destete masivo registrado correctamente');
    },
    onError: (error: any) => {
      console.error('Error in useBulkWean:', error);
      const msg = error.response?.data?.message || 'Error al procesar el destete masivo';
      toast.error(msg);
    }
  });
}

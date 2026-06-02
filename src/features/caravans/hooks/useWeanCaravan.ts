import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';

/**
 * useWeanCaravan
 *
 * Hook to record weaning for a calf (destete).
 * Sends a PATCH request to /caravans/{id}/wean.
 */
export interface WeanCaravanPayload {
  caravanId: number;
  targetBatchId: number;
  weaningDate: string;
  weaningWeight: number;
  newCategory?: string | null;
  notes?: string | null;
}

export function useWeanCaravan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WeanCaravanPayload) => {
      const { caravanId, ...body } = payload;
      const response = await axiosInstance.patch(`/caravans/${caravanId}/wean`, {
        target_batch_id: body.targetBatchId,
        weaning_date: body.weaningDate,
        weaning_weight: body.weaningWeight,
        new_category: body.newCategory,
        notes: body.notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['births-history'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      toast.success('Ternero destetado correctamente');
    },
    onError: (error: any) => {
      console.error('Error in useWeanCaravan:', error);
      const msg = error.response?.data?.message || 'Error al procesar el destete';
      toast.error(msg);
    }
  });
}

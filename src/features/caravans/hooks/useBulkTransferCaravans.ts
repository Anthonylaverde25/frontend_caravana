import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';

export interface BulkTransferCaravansPayload {
  caravanIds: number[];
  targetBatchId?: number | null;
  reason?: string | null;
  movementDate?: string | null;
}

export interface BulkTransferCaravansResponse {
  transferred_count: number;
  target_batch_id: number;
  target_batch_name: string;
}

/**
 * useBulkTransferCaravans
 *
 * Hook to transfer multiple caravans to another batch or auto-assign to the system Reserve Batch.
 * Sends a POST request to /caravans/bulk-transfer.
 */
export function useBulkTransferCaravans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkTransferCaravansPayload): Promise<BulkTransferCaravansResponse> => {
      const response = await axiosInstance.post('/caravans/bulk-transfer', {
        caravan_ids: payload.caravanIds,
        target_batch_id: payload.targetBatchId || null,
        reason: payload.reason || null,
        movement_date: payload.movementDate || null,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravan-movements'] });
      toast.success(`Se transfirieron ${data.transferred_count} animales a "${data.target_batch_name}" correctamente`);
    },
    onError: (error: any) => {
      console.error('Error in useBulkTransferCaravans:', error);
      const msg = error.response?.data?.message || 'Error al transferir los animales';
      toast.error(msg);
    }
  });
}

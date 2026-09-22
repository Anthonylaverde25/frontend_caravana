import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';

/** Destination batch created in the same transaction as the transfer. */
export interface NewTransferBatchPayload {
  name: string;
  activity_id?: number;
  batch_type_id?: number;
  is_confined?: boolean;
  farm_id?: number | null;
}

export interface BulkTransferCaravansPayload {
  caravanIds: number[];
  /** Mutually exclusive with `newBatch`. */
  targetBatchId?: number | null;
  newBatch?: NewTransferBatchPayload | null;
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
        new_batch: payload.newBatch || null,
        reason: payload.reason || null,
        movement_date: payload.movementDate || null,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['caravan-movements'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(`Se transfirieron ${data.transferred_count} animales a "${data.target_batch_name}" correctamente`);
    },
    onError: (error: any) => {
      console.error('Error in useBulkTransferCaravans:', error);
      const msg = error.response?.data?.message || 'Error al transferir los animales';
      toast.error(msg);
    }
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RegisterBatchWeighingPayload } from '@/core/weighing/domain/entities/Weighing';
import { ApiWeighingOrderRepository } from '@/core/weighing/infrastructure/repositories/ApiWeighingOrderRepository';

const repository = new ApiWeighingOrderRepository();

/** Registers a cage weighing of a whole batch; every view that shows weights is refreshed. */
export function useRegisterBatchWeighing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterBatchWeighingPayload) => repository.registerBatchWeighing(payload),
    onSuccess: (order) => {
      ['batches', 'batch', 'batch-weight-history', 'caravans', 'caravans-summary', 'caravan-weights', 'batch-weighing-orders'].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key] })
      );
      toast.success(`Pesaje ${order.code} registrado: ${order.total_heads} cabezas a ${order.average_weight?.toLocaleString('es-AR')} kg/cab`);
    },
  });
}

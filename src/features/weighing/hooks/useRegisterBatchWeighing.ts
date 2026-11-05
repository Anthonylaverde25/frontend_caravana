import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RegisterBatchWeighingPayload } from '@/core/weighing/domain/entities/Weighing';
import { ApiWeighingOrderRepository } from '@/core/weighing/infrastructure/repositories/ApiWeighingOrderRepository';

const repository = new ApiWeighingOrderRepository();

/** Registers a weighing of a batch; every view that shows weights is refreshed. */
export function useRegisterBatchWeighing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterBatchWeighingPayload) => repository.registerBatchWeighing(payload),
    onSuccess: (order) => {
      ['batches', 'batch', 'batch-weight-history', 'caravans', 'caravans-summary', 'caravan-weights', 'batch-weighing-orders'].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key] })
      );
      // Across several categories a single average would be the very figure this weighing avoids.
      const detail =
        order.category_averages.length > 1
          ? `${order.category_averages.length} categorías`
          : `${order.average_weight?.toLocaleString('es-AR')} kg/cab`;
      toast.success(`Pesaje ${order.code} registrado: ${order.total_heads} cabezas · ${detail}`);
    },
  });
}

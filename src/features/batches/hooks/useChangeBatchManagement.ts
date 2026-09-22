import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { toast } from 'sonner';

const batchRepository = new ApiBatchRepository();

/**
 * Changes the management system of a batch: confined (pen) or extensive (pasture).
 *
 * This is not a livestock movement: the batch keeps its activity, its type, its
 * animals and its weights. Only the flag changes.
 */
export function useChangeBatchManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isConfined }: { id: number; isConfined: boolean }) =>
      batchRepository.changeManagement(id, isConfined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      toast.success(
        `Lote "${data.name}" ahora se maneja ${data.is_confined ? 'a corral' : 'a campo'}.`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cambiar el sistema de manejo.');
    }
  });
}

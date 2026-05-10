import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { toast } from 'sonner';

const batchRepository = new ApiBatchRepository();

export function useChangeBatchActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activityId }: { id: number; activityId: number }) =>
      batchRepository.changeActivity(id, activityId),
    onSuccess: (data) => {
      // Invalidate both batches and activities to refresh the view
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      toast.success(`Lote "${data.name}" movido exitosamente.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al mover el lote.');
    }
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { DeleteCaravanUseCase } from '@/core/caravans/application/use-cases/DeleteCaravanUseCase';
import { toast } from 'sonner';

const caravanRepository = new ApiCaravanRepository();
const deleteCaravanUseCase = new DeleteCaravanUseCase(caravanRepository);

/**
 * useDeleteCaravan
 *
 * Hook to remove a caravan record.
 */
export function useDeleteCaravan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCaravanUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Caravana eliminada correctamente');
    },
    onError: (error: any) => {
      console.error('Error in deleteCaravan:', error);
      toast.error('Error al eliminar la caravana');
    }
  });
}

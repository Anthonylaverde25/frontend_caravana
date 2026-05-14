import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { UpsertCaravanUseCase } from '@/core/caravans/application/use-cases/UpsertCaravanUseCase';
import { CreateCaravanRequest } from '@/core/caravans/domain/entities/Caravan';
import { toast } from 'sonner';

const caravanRepository = new ApiCaravanRepository();
const upsertCaravanUseCase = new UpsertCaravanUseCase(caravanRepository);

/**
 * useUpsertCaravan
 *
 * Hook to create or update a caravan record.
 * Handles cache invalidation and UI notifications.
 */
export function useUpsertCaravan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaravanRequest) => upsertCaravanUseCase.execute(data),
    onSuccess: (response) => {
      // Invalidate all related queries to force a refetch
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      const message = response.action === 'created' 
        ? 'Caravana registrada exitosamente' 
        : 'Caravana actualizada correctamente';
      
      toast.success(message);
    },
    onError: (error: any) => {
      console.error('Error in upsertCaravan:', error);
      toast.error('Error al guardar la caravana: ' + (error.response?.data?.message || error.message));
    }
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { toast } from 'sonner';

const caravanRepository = new ApiCaravanRepository();

export function useRecordCaravanWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { weight: number; weighing_date: string; notes?: string } }) =>
      caravanRepository.recordWeight(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['caravan-weights', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Pesaje registrado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al registrar el pesaje: ' + (error.response?.data?.message || error.message));
    },
  });
}

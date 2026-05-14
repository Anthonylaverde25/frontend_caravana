import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { toast } from 'sonner';

const caravanRepository = new ApiCaravanRepository();

export interface BulkWeightEntry {
  caravan_id: number;
  weight: number;
  weighing_date: string;
  notes?: string;
}

export function useBulkRecordWeights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weights: BulkWeightEntry[]) =>
      caravanRepository.bulkRecordWeights(weights),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Pesajes masivos registrados exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al registrar pesajes masivos: ' + (error.response?.data?.message || error.message));
    },
  });
}

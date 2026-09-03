import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

interface AssignPayload {
  caravan_ids: number[];
  target_batch_id: number;
  entry_date?: string;
  observations?: string;
}

export function useAssignExternalCaravans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignPayload) => {
      const response = await axiosInstance.post('/batches/assign-to-own', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

export interface AssignSirePayload {
  calfId: number;
  father_id: number;
  identification_method: 'operational' | 'phenotype' | 'lab_genetic';
  sire_notes?: string | null;
}

export function useAssignSire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ calfId, ...body }: AssignSirePayload) => {
      const response = await axiosInstance.patch(`/caravans/${calfId}/assign-sire`, body);
      return response.data;
    },
    onSuccess: () => {
      // Refresh the pending sires list and caravan data
      queryClient.invalidateQueries({ queryKey: ['pending-sires'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
    },
  });
}

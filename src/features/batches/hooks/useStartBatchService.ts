import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useSnackbar } from 'notistack';

export interface StartBatchServicePayload {
  service_batch_name?: string;
  male_caravan_ids: number[];
  selected_female_caravan_ids?: number[];
  target_bull_ratio?: number;
  planned_start_date: string;
  planned_end_date?: string;
  service_type?: 'single' | 'multi' | 'rotation';
  is_controlled_service?: boolean;
  female_sire_assignments?: Array<{ female_caravan_id: number; assigned_male_caravan_id: number }>;
  observations?: string;
}

export function useStartBatchService(batchId?: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: StartBatchServicePayload & { id?: number }) => {
      const targetId = id ?? batchId;
      if (!targetId) throw new Error('ID de lote requerido para iniciar servicio');
      const response = await axiosInstance.post(`/batches/${targetId}/start-service`, payload);
      return response.data;
    },
    onSuccess: () => {
      enqueueSnackbar('Servicio de entore iniciado con éxito', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['gestation'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al iniciar el servicio de entore';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });
}

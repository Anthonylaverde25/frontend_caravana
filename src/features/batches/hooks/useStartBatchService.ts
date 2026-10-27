import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useSnackbar } from 'notistack';

/**
 * Starts a service on an operational Cría batch. No batch is created: the service is an order
 * over the batch, the females stay and the bulls join them.
 */
export interface StartBatchServicePayload {
  /** AI (semen S-B): no bulls, females picked one by one, semen planned per female. */
  service_method?: 'NATURAL' | 'AI';
  planned_semen?: Array<{ female_caravan_id: number; item_id: number | null }>;
  male_caravan_ids: number[];
  /** Only for controlled service / AI: natural service exposes every empty female of the batch. */
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
    onSuccess: (order: { service_method?: string }) => {
      enqueueSnackbar(order?.service_method === 'AI' ? 'Servicio de IA iniciado sobre el lote' : 'Servicio iniciado sobre el lote', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['gestation'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al iniciar el servicio';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });
}

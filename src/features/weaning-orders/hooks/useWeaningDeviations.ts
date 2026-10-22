import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { WeaningDeviation } from '../types';
import { weaningOrderErrorMessage } from '../types';
import { WEANING_ORDERS_KEY } from './useWeaningOrders';

export const WEANING_DEVIATIONS_KEY = 'weaning-deviations';

/** Every deviation of the company's weaning orders, newest first. Filtered on screen. */
export function useWeaningDeviations() {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [WEANING_DEVIATIONS_KEY, activeCompanyId],
    queryFn: async (): Promise<WeaningDeviation[]> => (await axiosInstance.get<WeaningDeviation[]>('/weaning-deviations')).data,
    enabled: Boolean(activeCompanyId)
  });
}

/** "Revisar": the deviations seen and the note that justifies them. Changes no order. */
export function useReviewWeaningDeviations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, note }: { ids: number[]; note: string }): Promise<WeaningDeviation[]> =>
      (await axiosInstance.post<WeaningDeviation[]>('/weaning-deviations/review', { ids, note })).data,
    onSuccess: (reviewed) => {
      queryClient.invalidateQueries({ queryKey: [WEANING_DEVIATIONS_KEY] });
      // The order's drawer shows each calf's review and a line in its history.
      queryClient.invalidateQueries({ queryKey: [WEANING_ORDERS_KEY] });
      toast.success(`${reviewed.length} desvío(s) revisado(s)`);
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudieron revisar los desvíos'))
  });
}

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { WeaningOrderSummary } from '../types';

export const WEANING_ORDERS_KEY = 'weaning-orders';

/** The weaning orders of the company, newest first, without their roll. Filtered on screen. */
export function useWeaningOrders() {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [WEANING_ORDERS_KEY, activeCompanyId, 'list'],
    queryFn: async (): Promise<WeaningOrderSummary[]> =>
      (await axiosInstance.get<WeaningOrderSummary[]>('/weaning-orders')).data,
    enabled: Boolean(activeCompanyId)
  });
}

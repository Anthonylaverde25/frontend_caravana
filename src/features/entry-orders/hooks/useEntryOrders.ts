import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { EntryOrder, EntryOrderSummary } from '../types';

export const ENTRY_ORDERS_KEY = 'entry-orders';

/** The entry orders of the company, newest first, with their DTEs but without caravans. */
export function useEntryOrders() {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [ENTRY_ORDERS_KEY, activeCompanyId, 'list'],
    queryFn: async (): Promise<EntryOrderSummary[]> => (await axiosInstance.get<EntryOrderSummary[]>('/entry-orders')).data,
    enabled: Boolean(activeCompanyId)
  });
}

/** One order in full: the caravans of each DTE, the incidents and the history. */
export function useEntryOrder(id: number | null) {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [ENTRY_ORDERS_KEY, activeCompanyId, 'detail', id],
    queryFn: async (): Promise<EntryOrder> => (await axiosInstance.get<EntryOrder>(`/entry-orders/${id}`)).data,
    enabled: Boolean(activeCompanyId) && id != null
  });
}

/**
 * The number the next order would get, only to preview an automatic batch name ("338-12"). The
 * server assigns the real one when the order is saved.
 */
export function useNextEntryOrderNumber(enabled = true) {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [ENTRY_ORDERS_KEY, activeCompanyId, 'next-number'],
    queryFn: async (): Promise<number> =>
      (await axiosInstance.get<{ number: number }>('/entry-orders/next-number')).data.number,
    enabled: Boolean(activeCompanyId) && enabled,
    staleTime: 0
  });
}

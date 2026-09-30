import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { WeaningOrder } from '../types';
import { WEANING_ORDERS_KEY } from './useWeaningOrders';

/** One order with its roll and history. Null id = nothing to load. */
export function useWeaningOrder(id: number | null) {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [WEANING_ORDERS_KEY, activeCompanyId, 'detail', id],
    queryFn: async (): Promise<WeaningOrder> => (await axiosInstance.get<WeaningOrder>(`/weaning-orders/${id}`)).data,
    enabled: Boolean(activeCompanyId) && id != null && id > 0
  });
}

/**
 * The order a scanned DEST-01 sheet names, by the code read off paper. The server cleans OCR
 * confusions (an O where a zero must be), so the raw reading is sent as is.
 *
 * A 404 is an answer — "the paper carries a code nobody issued" — not a failure to retry.
 */
export function useWeaningOrderByCode(code: string | null) {
  const { activeCompanyId } = useCompany();
  const clean = code?.trim() ?? '';

  return useQuery({
    queryKey: [WEANING_ORDERS_KEY, activeCompanyId, 'by-code', clean],
    queryFn: async (): Promise<WeaningOrder | null> => {
      try {
        return (await axiosInstance.get<WeaningOrder>(`/weaning-orders/by-code/${encodeURIComponent(clean)}`)).data;
      } catch (error) {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return null;

        throw error;
      }
    },
    enabled: Boolean(activeCompanyId) && clean !== '',
    retry: false
  });
}

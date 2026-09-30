import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { TransferOrder } from '../types';
import { TRANSFER_ORDERS_KEY } from './useTransferOrders';

/** One order with its roll and history. Null id = nothing to load. */
export function useTransferOrder(id: number | null) {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [TRANSFER_ORDERS_KEY, activeCompanyId, 'detail', id],
    queryFn: async (): Promise<TransferOrder> => {
      const response = await axiosInstance.get<TransferOrder>(`/transfer-orders/${id}`);

      return response.data;
    },
    enabled: Boolean(activeCompanyId) && id != null && id > 0
  });
}

/**
 * The order a scanned sheet names, by the code read off paper. The server cleans OCR
 * confusions (an O where a zero must be), so the raw reading is sent as is.
 *
 * A 404 is an answer — "the paper carries a code nobody issued" — not a failure to retry.
 */
export function useTransferOrderByCode(code: string | null) {
  const { activeCompanyId } = useCompany();
  const clean = code?.trim() ?? '';

  return useQuery({
    queryKey: [TRANSFER_ORDERS_KEY, activeCompanyId, 'by-code', clean],
    queryFn: async (): Promise<TransferOrder | null> => {
      try {
        const response = await axiosInstance.get<TransferOrder>(
          `/transfer-orders/by-code/${encodeURIComponent(clean)}`
        );

        return response.data;
      } catch (error) {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return null;

        throw error;
      }
    },
    enabled: Boolean(activeCompanyId) && clean !== '',
    retry: false
  });
}

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { TransferOrderStatus, TransferOrderSummary } from '../types';

export const TRANSFER_ORDERS_KEY = 'transfer-orders';

interface Filters {
  status?: TransferOrderStatus | null;
  sourceBatchId?: number | null;
}

/**
 * The orders of the company, newest first, without their roll. The list filters on the server
 * by status and source batch; everything else (search) is done on screen.
 */
export function useTransferOrders({ status = null, sourceBatchId = null }: Filters = {}) {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [TRANSFER_ORDERS_KEY, activeCompanyId, 'list', status, sourceBatchId],
    queryFn: async (): Promise<TransferOrderSummary[]> => {
      const response = await axiosInstance.get<TransferOrderSummary[]>('/transfer-orders', {
        params: { status: status ?? undefined, source_batch_id: sourceBatchId ?? undefined }
      });

      return response.data;
    },
    enabled: Boolean(activeCompanyId)
  });
}

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { BirthOrderSummary } from '../types';

export const BIRTH_ORDERS_KEY = 'birth-orders';

/** The birth orders of the company, newest first, without their roll. Filtered on screen. */
export function useBirthOrders() {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [BIRTH_ORDERS_KEY, activeCompanyId, 'list'],
    queryFn: async (): Promise<BirthOrderSummary[]> => (await axiosInstance.get<BirthOrderSummary[]>('/birth-orders')).data,
    enabled: Boolean(activeCompanyId)
  });
}

/** Females held by an open birth order, by caravan id: a new order does not offer them. */
export function useOpenBirthOrderMothers() {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: [BIRTH_ORDERS_KEY, activeCompanyId, 'open-mothers'],
    queryFn: async (): Promise<Map<number, string>> => {
      const rows = (await axiosInstance.get<{ caravan_id: number; code: string }[]>('/birth-orders/open-mothers')).data;

      return new Map(rows.map((row) => [row.caravan_id, row.code]));
    },
    enabled: Boolean(activeCompanyId)
  });
}

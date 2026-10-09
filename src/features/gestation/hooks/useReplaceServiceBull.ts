import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

export interface BullReplacement {
  id: number;
  company_id: number;
  service_order_id: number;
  retired_male_caravan_id: number;
  replacement_male_caravan_id: number;
  replacement_date: string;
  reason: string;
  reason_label: string;
  destination_batch_id: number | null;
  notes: string | null;
  user_id: number | null;
  retired_male?: {
    id: number;
    identification: string;
    category?: string;
    breed?: string;
    current_weight?: number;
  } | null;
  replacement_male?: {
    id: number;
    identification: string;
    category?: string;
    breed?: string;
    current_weight?: number;
    scrotal_circumference?: number;
  } | null;
  destination_batch?: {
    id: number;
    name: string;
  } | null;
  user_name?: string | null;
  created_at?: string;
}

export interface ReplaceServiceBullInput {
  serviceOrderId: number;
  retired_male_caravan_id: number;
  replacement_male_caravan_id: number;
  replacement_date: string;
  reason: string;
  destination_batch_id?: number | null;
  notes?: string | null;
}

/**
 * Mutation hook to replace an injured or low-libido bull in an active service order.
 */
export function useReplaceServiceBull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReplaceServiceBullInput) => {
      const { serviceOrderId, ...payload } = input;
      const response = await axiosInstance.post<{
        message: string;
        replacement: BullReplacement;
      }>(`/service-orders/${serviceOrderId}/replace-bull`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
    },
  });
}

/**
 * Hook to fetch the history of bull replacements for a specific service order.
 */
export function useBullReplacements(serviceOrderId?: number | null) {
  return useQuery<BullReplacement[]>({
    queryKey: ['bull-replacements', serviceOrderId],
    queryFn: async () => {
      if (!serviceOrderId) return [];
      const response = await axiosInstance.get<BullReplacement[]>(
        `/service-orders/${serviceOrderId}/bull-replacements`
      );
      return response.data;
    },
    enabled: Boolean(serviceOrderId),
  });
}

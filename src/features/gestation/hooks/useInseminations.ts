import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useInvalidateStock } from '@/features/stock/hooks/useInvalidateStock';
import type { Insemination, InseminationRowPayload, SemenCoverage } from '../types/insemination';
import type { NotInseminatedReason, ServiceOrder } from './useServiceOrders';

/** Reasons sent with the end of the service or the closing: only for females never inseminated. */
export type NotInseminatedReasonsPayload = { female_caravan_id: number; reason: NotInseminatedReason | null }[];

export const inseminationKeys = {
  order: (orderId: number) => ['service-orders', orderId, 'inseminations'] as const,
  coverage: (itemIds: number[], extra: Record<number, number>) => ['service-orders', 'semen-coverage', itemIds, extra] as const,
};

/** The orders, the order's inseminations and every stock view move together. */
function useInvalidateAfterInsemination() {
  const queryClient = useQueryClient();
  const invalidateStock = useInvalidateStock();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['service-orders'] }),
      queryClient.invalidateQueries({ queryKey: ['batches'] }),
      queryClient.invalidateQueries({ queryKey: ['caravans'] }),
      invalidateStock(),
    ]);
}

export function useOrderInseminations(orderId: number | null | undefined) {
  return useQuery<Insemination[]>({
    queryKey: inseminationKeys.order(orderId ?? 0),
    queryFn: async () => (await axiosInstance.get(`/service-orders/${orderId}/inseminations`)).data,
    enabled: Boolean(orderId),
  });
}

export function useRegisterInseminations() {
  const invalidate = useInvalidateAfterInsemination();

  return useMutation({
    mutationFn: async ({ orderId, rows, idempotencyKey }: { orderId: number; rows: InseminationRowPayload[]; idempotencyKey: string }) =>
      (await axiosInstance.post(`/service-orders/${orderId}/inseminations`, { rows, idempotency_key: idempotencyKey })).data as {
        order: ServiceOrder;
        documents: { id: number; number: number; warehouse?: { code?: string | null } | null }[];
        incidents: unknown[];
      },
    onSuccess: () => invalidate(),
  });
}

export function useVoidInsemination() {
  const invalidate = useInvalidateAfterInsemination();

  return useMutation({
    mutationFn: async ({ orderId, inseminationId, reason, idempotencyKey }: { orderId: number; inseminationId: number; reason: string; idempotencyKey: string }) =>
      (await axiosInstance.post(`/service-orders/${orderId}/inseminations/${inseminationId}/void`, { reason, idempotency_key: idempotencyKey })).data as ServiceOrder,
    onSuccess: () => invalidate(),
  });
}

export function useEndInseminationService() {
  const invalidate = useInvalidateAfterInsemination();

  return useMutation({
    mutationFn: async ({ orderId, endDate, reasons, observations }: { orderId: number; endDate: string; reasons: NotInseminatedReasonsPayload; observations?: string }) =>
      (await axiosInstance.post(`/service-orders/${orderId}/end-service`, {
        end_date: endDate,
        not_inseminated_reasons: reasons,
        observations: observations || undefined,
      })).data as ServiceOrder,
    onSuccess: () => invalidate(),
  });
}

export function useAddRepasoBulls() {
  const invalidate = useInvalidateAfterInsemination();

  return useMutation({
    mutationFn: async ({ orderId, maleCaravanIds, joinedAt }: { orderId: number; maleCaravanIds: number[]; joinedAt: string }) =>
      (await axiosInstance.post(`/service-orders/${orderId}/repaso-bulls`, { male_caravan_ids: maleCaravanIds, joined_at: joinedAt })).data as ServiceOrder,
    onSuccess: () => invalidate(),
  });
}

/** Will the semen be enough? Informative only (P4): nothing is reserved. */
export function useSemenCoverage(itemIds: number[], extra: Record<number, number> = {}) {
  return useQuery<SemenCoverage[]>({
    queryKey: inseminationKeys.coverage(itemIds, extra),
    queryFn: async () => {
      const params = new URLSearchParams();
      itemIds.forEach((id) => params.append('item_ids[]', String(id)));
      Object.entries(extra).forEach(([id, straws]) => params.append(`extra[${id}]`, String(straws)));
      return (await axiosInstance.get(`/semen/coverage?${params.toString()}`)).data;
    },
    enabled: itemIds.length > 0 || Object.keys(extra).length > 0,
  });
}

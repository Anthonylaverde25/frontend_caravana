import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import {
  EmitWeaningOrderPayload,
  ExecuteWeaningOrderBody,
  RegisterWeaningPayload,
  RegisterWeaningResult,
  WeaningOrder,
  WeaningResult,
  weaningOrderErrorMessage
} from '../types';
import { WEANING_ORDERS_KEY } from './useWeaningOrders';

/** Every change to an order can change the list, the detail and, once calves are weaned, the herd. */
const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return (alsoLivestock = false) => {
    queryClient.invalidateQueries({ queryKey: [WEANING_ORDERS_KEY] });
    // A weaning order commits calves: the births list marks them.
    queryClient.invalidateQueries({ queryKey: ['births-history'] });

    if (alsoLivestock) {
      ['caravans', 'batches', 'batch', 'activities', 'batch-weight-history', 'caravan-movements'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    }
  };
};

/** "Guardar borrador" or "Crear y emitir". */
export function useCreateWeaningOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: EmitWeaningOrderPayload): Promise<WeaningOrder> =>
      (await axiosInstance.post<WeaningOrder>('/weaning-orders', payload)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(order.status === 'DRAFT' ? `Borrador ${order.code} guardado` : `Orden ${order.code} emitida`);
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudo crear la orden de destete'))
  });
}

/** "Guardar cambios" on a draft. */
export function useUpdateWeaningOrderDraft() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmitWeaningOrderPayload }): Promise<WeaningOrder> =>
      (await axiosInstance.put<WeaningOrder>(`/weaning-orders/${id}`, payload)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Borrador ${order.code} actualizado`);
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudo guardar el borrador'))
  });
}

/** "Registrar destete": the weaning already happened; the order is born executed. */
export function useRegisterWeaning() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: RegisterWeaningPayload): Promise<RegisterWeaningResult> =>
      (await axiosInstance.post<RegisterWeaningResult>('/weaning-orders/register', payload)).data,
    onSuccess: ({ order, warnings }) => {
      invalidate(true);
      toast.success(`Destete ${order.code} registrado: ${order.weaned_head_count} crías destetadas`);
      warnings.forEach((warning) => toast.warning(warning.message, { duration: 10000 }));
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudo registrar el destete'))
  });
}

/** Draft → issued: from here it commits calves and can be printed and executed. */
export function useIssueWeaningOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<WeaningOrder> =>
      (await axiosInstance.post<WeaningOrder>(`/weaning-orders/${id}/issue`)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Orden ${order.code} emitida`);
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudo emitir la orden'))
  });
}

/** Stamps `printed_at`. Silent: printing is the operator's act, this only records it. */
export function useMarkWeaningOrderPrinted() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<WeaningOrder> =>
      (await axiosInstance.post<WeaningOrder>(`/weaning-orders/${id}/printed`)).data,
    onSuccess: () => invalidate()
  });
}

export function useCancelWeaningOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string | null }): Promise<WeaningOrder> =>
      (await axiosInstance.post<WeaningOrder>(`/weaning-orders/${id}/cancel`, { reason })).data,
    onSuccess: (order, variables) => {
      invalidate();
      toast.success(variables.reason ? `Orden ${order.code} anulada` : `Borrador ${order.code} descartado`);
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudo anular la orden'))
  });
}

export function useCloseIncompleteWeaningOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }): Promise<WeaningOrder> =>
      (await axiosInstance.post<WeaningOrder>(`/weaning-orders/${id}/close-incomplete`, { reason })).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Orden ${order.code} cerrada incompleta`);
    },
    onError: (error) => toast.error(weaningOrderErrorMessage(error, 'No se pudo cerrar la orden'))
  });
}

/**
 * "Ejecutar orden" from the screen: the server weans the ORDER's pending calves, through the same
 * channel a scanned DEST-01 sheet uses.
 */
export function useExecuteWeaningOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body?: ExecuteWeaningOrderBody }): Promise<WeaningResult> =>
      (await axiosInstance.post<{ data: WeaningResult }>(`/weaning-orders/${id}/execute`, body ?? {})).data.data,
    onSuccess: (result) => {
      invalidate(true);
      const order = result.weaning_order;
      toast.success(
        order
          ? `Orden ${order.code} ${order.status === 'EXECUTED' ? 'ejecutada' : 'ejecutada en parte'}: ${order.weaned_now} crías destetadas`
          : 'Destete registrado'
      );
      (result.warnings ?? []).slice(0, 4).forEach((warning) => toast.warning(warning.message));
    }
  });
}

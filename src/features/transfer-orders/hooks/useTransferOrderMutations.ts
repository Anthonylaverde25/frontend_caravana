import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import type { Cact01SuccessResult } from '@/ui/work-templates/components/scan/types';
import {
  EmitTransferOrderPayload,
  RegisterTransferPayload,
  RegisterTransferResult,
  TransferOrder,
  TransferRowError,
  transferOrderErrorMessage
} from '../types';
import { TRANSFER_ORDERS_KEY } from './useTransferOrders';

/** Every change to an order can change the list, the detail and the animals it committed. */
const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return (alsoLivestock = false) => {
    queryClient.invalidateQueries({ queryKey: [TRANSFER_ORDERS_KEY] });

    if (alsoLivestock) {
      ['caravans', 'batches', 'batch', 'activities', 'batch-weight-history', 'caravan-movements'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    }
  };
};

/**
 * Creates the order: a draft by default ("Guardar borrador"), or already issued ("Crear y
 * emitir orden").
 */
export function useCreateTransferOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: EmitTransferOrderPayload): Promise<TransferOrder> =>
      (await axiosInstance.post<TransferOrder>('/transfer-orders', payload)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(order.status === 'DRAFT' ? `Borrador ${order.code} guardado` : `Orden ${order.code} emitida`);
    },
    onError: (error) => toast.error(transferOrderErrorMessage(error, 'No se pudo crear la orden'))
  });
}

/**
 * "Registrar transferencia": the movement already happened in the field. The order is born
 * executed, so the animals, the batches and their curves change with it.
 */
export function useRegisterTransfer() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: RegisterTransferPayload): Promise<RegisterTransferResult> =>
      (await axiosInstance.post<RegisterTransferResult>('/transfer-orders/register', payload)).data,
    onSuccess: ({ order, warnings }) => {
      invalidate(true);
      toast.success(`Transferencia ${order.code} registrada: ${order.moved_head_count} animales movidos`);
      // What the chute data could not change is said, not swallowed (a dentition that went down).
      warnings.forEach((warning) => toast.warning(warning.message, { duration: 10000 }));
    },
    onError: (error) => {
      const rowError = (error as { response?: { data?: { row_errors?: TransferRowError[] } } })?.response?.data
        ?.row_errors?.[0];

      toast.error(
        rowError
          ? `${rowError.caravana}: ${rowError.errors[0]?.message ?? 'no se pudo registrar'}`
          : transferOrderErrorMessage(error, 'No se pudo registrar la transferencia')
      );
    }
  });
}

/** "Guardar cambios" on a draft: replaces what it orders with what the screen shows. */
export function useUpdateTransferOrderDraft() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmitTransferOrderPayload }): Promise<TransferOrder> =>
      (await axiosInstance.put<TransferOrder>(`/transfer-orders/${id}`, payload)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Borrador ${order.code} actualizado`);
    },
    onError: (error) => toast.error(transferOrderErrorMessage(error, 'No se pudo guardar el borrador'))
  });
}

/** Draft → issued: from here it commits animals and can be printed and executed. */
export function useIssueTransferOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<TransferOrder> =>
      (await axiosInstance.post<TransferOrder>(`/transfer-orders/${id}/issue`)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Orden ${order.code} emitida`);
    },
    onError: (error) => toast.error(transferOrderErrorMessage(error, 'No se pudo emitir la orden'))
  });
}

/** Stamps `printed_at`. Silent: printing is the operator's act, this only records it. */
export function useMarkTransferOrderPrinted() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<TransferOrder> =>
      (await axiosInstance.post<TransferOrder>(`/transfer-orders/${id}/printed`)).data,
    onSuccess: () => invalidate()
  });
}

export function useCancelTransferOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string | null }): Promise<TransferOrder> =>
      (await axiosInstance.post<TransferOrder>(`/transfer-orders/${id}/cancel`, { reason })).data,
    onSuccess: (order, variables) => {
      invalidate();
      toast.success(variables.reason ? `Orden ${order.code} anulada` : `Borrador ${order.code} descartado`);
    },
    onError: (error) => toast.error(transferOrderErrorMessage(error, 'No se pudo anular la orden'))
  });
}

export function useCloseIncompleteTransferOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }): Promise<TransferOrder> =>
      (await axiosInstance.post<TransferOrder>(`/transfer-orders/${id}/close-incomplete`, { reason })).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Orden ${order.code} cerrada incompleta`);
    },
    onError: (error) => toast.error(transferOrderErrorMessage(error, 'No se pudo cerrar la orden'))
  });
}

/** What "Ejecutar orden" declares: the day it happened and, per animal, the C/S chosen. */
export interface ExecuteTransferOrderBody {
  movement_date?: string;
  animals?: { caravan_id: number; category_id: number; subcategory_id: number | null }[];
}

/**
 * "Transferir" with an order issued: the server executes the ORDER, not what the screen shows,
 * through the same channel a scanned sheet uses.
 */
export function useExecuteTransferOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body?: ExecuteTransferOrderBody }): Promise<Cact01SuccessResult> =>
      (await axiosInstance.post<{ data: Cact01SuccessResult }>(`/transfer-orders/${id}/execute`, body ?? {})).data.data,
    onSuccess: (result) => {
      invalidate(true);
      const order = result.transfer_order;
      toast.success(
        order
          ? `Orden ${order.code} ${order.status === 'EXECUTED' ? 'ejecutada' : 'ejecutada en parte'}: ${order.moved_now} animales movidos`
          : 'Transferencia registrada'
      );
      // The movement went through; what the herd says about it is shown, not swallowed.
      (result.warnings ?? []).slice(0, 4).forEach((warning) => toast.warning(warning.message));
    },
    onError: (error) => {
      const body = (error as { response?: { data?: { header_errors?: { message: string }[]; row_errors?: { errors: { message: string }[] }[] } } })
        ?.response?.data;
      const detail = body?.header_errors?.[0]?.message ?? body?.row_errors?.[0]?.errors?.[0]?.message;

      toast.error(detail ?? transferOrderErrorMessage(error, 'No se pudo ejecutar la orden'));
    }
  });
}

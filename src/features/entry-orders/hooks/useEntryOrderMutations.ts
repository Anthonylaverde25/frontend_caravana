import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import {
  EntryOrder,
  EntryOrderResult,
  LoadDtePayload,
  RegisterEntryPayload,
  StoreEntryOrderPayload,
  entryOrderErrorMessage
} from '../types';
import { ENTRY_ORDERS_KEY } from './useEntryOrders';

/** Every change to an order can change the list and the detail; confirming or loading a DTE also the batches and the herd. */
const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return (alsoLivestock = false) => {
    queryClient.invalidateQueries({ queryKey: [ENTRY_ORDERS_KEY] });

    if (alsoLivestock) {
      ['caravans', 'batches', 'batch', 'batch-weight-history', 'caravan-movements'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    }
  };
};

const showWarnings = (result: EntryOrderResult) =>
  result.warnings.forEach((warning) => toast.warning(warning.message, { duration: 10000 }));

/**
 * "Guardar borrador" or "Confirmar compra". Errors are not toasted here: the form maps them to its
 * fields, and only what belongs to no field is shown by the caller.
 */
export function useCreateEntryOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: StoreEntryOrderPayload): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>('/entry-orders', payload)).data,
    onSuccess: (result) => {
      invalidate(result.order.status !== 'DRAFT');
      toast.success(
        result.order.status === 'DRAFT'
          ? `Borrador ${result.order.code} guardado`
          : `Orden ${result.order.code} creada. El lote ${result.order.batch_name} queda en espera del DTE.`
      );
      showWarnings(result);
    }
  });
}

/** "Guardar cambios" on a draft, or "Confirmar compra" from it. */
export function useUpdateEntryOrderDraft() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: StoreEntryOrderPayload }): Promise<EntryOrderResult> =>
      (await axiosInstance.put<EntryOrderResult>(`/entry-orders/${id}`, payload)).data,
    onSuccess: (result) => {
      invalidate(result.order.status !== 'DRAFT');
      toast.success(
        result.order.status === 'DRAFT'
          ? `Borrador ${result.order.code} actualizado`
          : `Orden ${result.order.code} confirmada. El lote ${result.order.batch_name} queda en espera del DTE.`
      );
      showWarnings(result);
    }
  });
}

/** Draft → awaiting DTE: creates the external batch, empty. */
export function useConfirmEntryOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>(`/entry-orders/${id}/confirm`)).data,
    onSuccess: (result) => {
      invalidate(true);
      toast.success(`Orden ${result.order.code} confirmada. El lote ${result.order.batch_name} queda en espera del DTE.`);
      showWarnings(result);
    },
    onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo confirmar la compra'))
  });
}

/** "Cargar DTE". Row errors come back to the grid; the caller decides how to show them. */
export function useLoadEntryOrderDte() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: LoadDtePayload }): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>(`/entry-orders/${id}/dtes`, payload)).data,
    onSuccess: (result, variables) => {
      invalidate(true);
      toast.success(
        result.order.status === 'COMPLETED'
          ? `DTE ${variables.payload.dte_number} cargado: la orden ${result.order.code} está completa`
          : `DTE ${variables.payload.dte_number} cargado: ${result.order.pending_count === 1 ? 'falta 1 cabeza' : `faltan ${result.order.pending_count} cabezas`}`
      );
      showWarnings(result);
    }
  });
}

/** "Registrar ingreso": the order, its batch and its DTE in one step. */
export function useRegisterEntry() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: RegisterEntryPayload): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>('/entry-orders/register', payload)).data,
    onSuccess: (result) => {
      invalidate(true);
      toast.success(
        `Ingreso ${result.order.code} registrado: ${result.order.entered_count} ${result.order.entered_count === 1 ? 'cabeza' : 'cabezas'} en ${result.order.batch_name}`
      );
      showWarnings(result);
    }
  });
}

/** Stamps `printed_at`. Silent: printing is the operator's act, this only records it. */
export function useMarkEntryOrderPrinted() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<EntryOrder> =>
      (await axiosInstance.post<EntryOrder>(`/entry-orders/${id}/printed`)).data,
    onSuccess: () => invalidate()
  });
}

export function useCancelEntryOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string | null }): Promise<EntryOrder> =>
      (await axiosInstance.post<EntryOrder>(`/entry-orders/${id}/cancel`, { reason })).data,
    onSuccess: (order, variables) => {
      invalidate(true);
      toast.success(variables.reason ? `Orden ${order.code} anulada` : `Borrador ${order.code} descartado`);
    },
    onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo anular la orden'))
  });
}

export function useCloseIncompleteEntryOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }): Promise<EntryOrder> =>
      (await axiosInstance.post<EntryOrder>(`/entry-orders/${id}/close-incomplete`, { reason })).data,
    onSuccess: (order) => {
      invalidate(true);
      toast.success(`Orden ${order.code} cerrada incompleta`);
    },
    onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo cerrar la orden'))
  });
}

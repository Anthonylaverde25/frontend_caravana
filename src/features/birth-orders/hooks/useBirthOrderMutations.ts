import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import {
  BirthOrder,
  BirthResult,
  EmitBirthOrderPayload,
  ExecuteBirthOrderBody,
  RegisterBirthsPayload,
  RegisterBirthsResult,
  birthOrderErrorMessage
} from '../types';
import { BIRTH_ORDERS_KEY } from './useBirthOrders';

/** Every change to an order can change the list, the detail and, once calves are born, the herd. */
const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return (alsoLivestock = false) => {
    queryClient.invalidateQueries({ queryKey: [BIRTH_ORDERS_KEY] });

    if (alsoLivestock) {
      ['caravans', 'batches', 'batch', 'births-history', 'batch-weight-history', 'pending-sires', 'gestation-dashboard'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    }
  };
};

const toastWarnings = (result: BirthResult) =>
  (result.warnings ?? []).slice(0, 4).forEach((warning) => toast.warning(warning.message, { duration: 8000 }));

/** "Guardar borrador" or "Crear y emitir". */
export function useCreateBirthOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: EmitBirthOrderPayload): Promise<BirthOrder> =>
      (await axiosInstance.post<BirthOrder>('/birth-orders', payload)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(order.status === 'DRAFT' ? `Borrador ${order.code} guardado` : `Orden ${order.code} emitida`);
    },
    onError: (error) => toast.error(birthOrderErrorMessage(error, 'No se pudo crear la orden de parición'))
  });
}

/** "Guardar cambios" on a draft. */
export function useUpdateBirthOrderDraft() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmitBirthOrderPayload }): Promise<BirthOrder> =>
      (await axiosInstance.put<BirthOrder>(`/birth-orders/${id}`, payload)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Borrador ${order.code} actualizado`);
    },
    onError: (error) => toast.error(birthOrderErrorMessage(error, 'No se pudo guardar el borrador'))
  });
}

/** "Registrar partos": the calvings already happened; the order is born executed. Row errors stay on the grid. */
export function useRegisterBirths() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (payload: RegisterBirthsPayload): Promise<RegisterBirthsResult> =>
      (await axiosInstance.post<RegisterBirthsResult>('/birth-orders/register', payload)).data,
    onSuccess: (result) => {
      invalidate(true);
      toast.success(`${result.order.code}: ${result.message}`);
      toastWarnings(result.data);
    },
    onError: (error) => toast.error(birthOrderErrorMessage(error, 'No se pudieron registrar los partos'))
  });
}

/** Draft → issued: from here it holds its females and can be printed and executed. */
export function useIssueBirthOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<BirthOrder> => (await axiosInstance.post<BirthOrder>(`/birth-orders/${id}/issue`)).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Orden ${order.code} emitida`);
    },
    onError: (error) => toast.error(birthOrderErrorMessage(error, 'No se pudo emitir la orden'))
  });
}

/** Stamps `printed_at`. Silent: printing is the operator's act, this only records it. */
export function useMarkBirthOrderPrinted() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async (id: number): Promise<BirthOrder> => (await axiosInstance.post<BirthOrder>(`/birth-orders/${id}/printed`)).data,
    onSuccess: () => invalidate()
  });
}

export function useCancelBirthOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string | null }): Promise<BirthOrder> =>
      (await axiosInstance.post<BirthOrder>(`/birth-orders/${id}/cancel`, { reason })).data,
    onSuccess: (order, variables) => {
      invalidate();
      toast.success(variables.reason ? `Orden ${order.code} anulada` : `Borrador ${order.code} descartado`);
    },
    onError: (error) => toast.error(birthOrderErrorMessage(error, 'No se pudo anular la orden'))
  });
}

export function useCloseIncompleteBirthOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }): Promise<BirthOrder> =>
      (await axiosInstance.post<BirthOrder>(`/birth-orders/${id}/close-incomplete`, { reason })).data,
    onSuccess: (order) => {
      invalidate();
      toast.success(`Orden ${order.code} cerrada incompleta`);
    },
    onError: (error) => toast.error(birthOrderErrorMessage(error, 'No se pudo cerrar la orden'))
  });
}

/**
 * "Ejecutar orden" from the screen: one round, through the same channel a scanned PAR-01 sheet
 * uses. Row errors come back for the grid to mark; they are not toasted.
 */
export function useExecuteBirthOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: ExecuteBirthOrderBody }): Promise<BirthResult> =>
      (await axiosInstance.post<{ data: BirthResult }>(`/birth-orders/${id}/execute`, body)).data.data,
    onSuccess: (result) => {
      invalidate(true);
      const order = result.birth_order;
      toast.success(
        `Orden ${order.code} ${order.status === 'EXECUTED' ? 'completa' : 'parcial'}: ${result.live_count} parto(s), ${result.stillborn_count + result.abortion_count} pérdida(s)`
      );
      toastWarnings(result);
    }
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import {
  EntryOrder,
  CorrectDteHeadCountPayload,
  EntryOrderResult,
  LoadDtePayload,
  ReceivePayload,
  RegisterEntryPayload,
  StoreEntryOrderPayload,
  TriReading,
  ReferenceMode,
  WeighingMode,
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

/**
 * A "Ver orden" on the toast, so an order saved away from the tray (e.g. from the external
 * batches, where a draft has no batch to show yet) can be reached at once. The tray opens it itself.
 */
const useOpenOrderAction = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (orderId: number) =>
    pathname.startsWith('/entry-orders') ? undefined : { label: 'Ver orden', onClick: () => navigate(`/entry-orders?orderId=${orderId}`) };
};

const showWarnings = (result: EntryOrderResult) =>
  result.warnings.forEach((warning) => toast.warning(warning.message, { duration: 10000 }));

/**
 * "Guardar borrador" or "Confirmar compra". Errors are not toasted here: the form maps them to its
 * fields, and only what belongs to no field is shown by the caller.
 */
export function useCreateEntryOrder() {
  const invalidate = useInvalidateOrders();
  const openOrder = useOpenOrderAction();

  return useMutation({
    mutationFn: async (payload: StoreEntryOrderPayload): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>('/entry-orders', payload)).data,
    onSuccess: (result) => {
      invalidate(result.order.status !== 'DRAFT');
      toast.success(
        result.order.status === 'DRAFT'
          ? `Borrador ${result.order.code} guardado`
          : `Orden ${result.order.code} creada. El lote ${result.order.batch_name} queda en espera del DTE.`,
        { action: openOrder(result.order.id), duration: 8000 }
      );
      showWarnings(result);
    }
  });
}

/** "Guardar cambios" on a draft, or "Confirmar compra" from it. */
export function useUpdateEntryOrderDraft() {
  const invalidate = useInvalidateOrders();
  const openOrder = useOpenOrderAction();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: StoreEntryOrderPayload }): Promise<EntryOrderResult> =>
      (await axiosInstance.put<EntryOrderResult>(`/entry-orders/${id}`, payload)).data,
    onSuccess: (result) => {
      invalidate(result.order.status !== 'DRAFT');
      toast.success(
        result.order.status === 'DRAFT'
          ? `Borrador ${result.order.code} actualizado`
          : `Orden ${result.order.code} confirmada. El lote ${result.order.batch_name} queda en espera del DTE.`,
        { action: openOrder(result.order.id), duration: 8000 }
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

const heads = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`);

/**
 * "Cargar DTE": its head are in transit from now on. Header errors come back to the form; the
 * caller decides how to show them.
 */
export function useLoadEntryOrderDte() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: LoadDtePayload }): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>(`/entry-orders/${id}/dtes`, payload)).data,
    onSuccess: (result, variables) => {
      invalidate(true);
      const pending = result.order.pending_dte_count;
      toast.success(
        `DTE ${variables.payload.dte_number} cargado: ${heads(variables.payload.head_count, 'cabeza en tránsito', 'cabezas en tránsito')}` +
          (pending > 0 ? `. ${pending === 1 ? 'Falta DTE para 1 cabeza' : `Falta DTE para ${pending} cabezas`}.` : '.')
      );
      showWarnings(result);
    }
  });
}

/** "Recibir": the animals arrived. Row errors come back to the dialog. */
export function useReceiveEntryOrder() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ReceivePayload }): Promise<EntryOrderResult> =>
      (await axiosInstance.post<EntryOrderResult>(`/entry-orders/${id}/receive`, payload)).data,
    onSuccess: (result, variables) => {
      invalidate(true);
      const caravans = variables.payload.animals.length;
      const counted = variables.payload.received_head_count;
      const missing = variables.payload.missing_head_count;
      const parts = [
        counted != null ? heads(counted, 'cabeza recibida', 'cabezas recibidas') : null,
        caravans > 0 ? heads(caravans, counted != null ? 'con caravana' : 'caravana cargada', counted != null ? 'con caravana' : 'caravanas cargadas') : null,
        missing > 0 ? heads(missing, 'cabeza no llegará', 'cabezas no llegarán') : null
      ].filter(Boolean);
      toast.success(
        `${parts.join(' · ')}. Orden ${result.order.code}: ${result.order.status_label.toLowerCase()}.`
      );
      showWarnings(result);
    }
  });
}

/** "Corregir cabezas": the head of a DTE were loaded wrong. Warnings say what it left behind. */
export function useCorrectDteHeadCount() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, dteId, payload }: { id: number; dteId: number; payload: CorrectDteHeadCountPayload }): Promise<EntryOrderResult> =>
      (await axiosInstance.patch<EntryOrderResult>(`/entry-orders/${id}/dtes/${dteId}`, payload)).data,
    onSuccess: (result, variables) => {
      invalidate(true);
      toast.success(`DTE corregido: declara ${heads(variables.payload.head_count, 'cabeza', 'cabezas')}. Orden ${result.order.code}: ${result.order.status_label.toLowerCase()}.`);
      showWarnings(result);
    }
  });
}

/** Writes down what was agreed with the provider about an incident. */
export function useResolveEntryOrderIncident() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, incidentId, resolution }: { id: number; incidentId: number; resolution: string }): Promise<EntryOrder> =>
      (await axiosInstance.post<EntryOrder>(`/entry-orders/${id}/incidents/${incidentId}/resolve`, { resolution })).data,
    onSuccess: () => {
      invalidate();
      toast.success('Novedad resuelta');
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
        `Ingreso ${result.order.code} registrado: ${heads(result.order.received_count, 'cabeza', 'cabezas')} en ${result.order.batch_name}`
      );
      showWarnings(result);
    }
  });
}

/**
 * Issues the ING-03 receipt sheet of a DTE (replacing the one still out, if any). Answers the
 * order, with the new sheet last.
 */
export function useIssueReceiptSheet() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, dteId }: { id: number; dteId: number }): Promise<{ order: EntryOrder; sheet_number: number }> =>
      (await axiosInstance.post<{ order: EntryOrder; sheet_number: number }>(`/entry-orders/${id}/receipt-sheets`, { dte_id: dteId })).data,
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo generar la hoja de recepción'))
  });
}

/**
 * What a sheet not yet printed prints: how it is weighed (per animal or one average) and how its
 * lines name breed, coat and category (in words or by code).
 */
export function useConfigureReceiptSheet() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({
      id,
      sheetId,
      weighingMode,
      referenceMode
    }: {
      id: number;
      sheetId: number;
      weighingMode?: WeighingMode;
      referenceMode?: ReferenceMode;
    }): Promise<EntryOrder> =>
      (await axiosInstance.patch<EntryOrder>(`/entry-orders/${id}/receipt-sheets/${sheetId}`, { weighing_mode: weighingMode, reference_mode: referenceMode })).data,
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo cambiar la configuración de la hoja'))
  });
}

/** Stamps the sheet's `printed_at`. Silent, like the ING-02's. */
export function useMarkReceiptSheetPrinted() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: async ({ id, sheetId }: { id: number; sheetId: number }): Promise<EntryOrder> =>
      (await axiosInstance.post<EntryOrder>(`/entry-orders/${id}/receipt-sheets/${sheetId}/printed`)).data,
    onSuccess: () => invalidate()
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

/**
 * "Adjuntar TRI": the AI reads the caravans of the SENASA TRI (a photo per page, or a PDF). Only
 * reads; the caravans are reviewed in the reception before registering it.
 */
export function useReadTri() {
  return useMutation({
    mutationFn: async ({ orderId, files }: { orderId: number; files: File[] }): Promise<TriReading> => {
      const form = new FormData();
      files.forEach((file) => form.append('documents[]', file));

      return (await axiosInstance.post<TriReading>(`/entry-orders/${orderId}/tri`, form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 })).data;
    }
  });
}

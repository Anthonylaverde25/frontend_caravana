import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { useTransferOrders, TRANSFER_ORDERS_KEY } from '@/features/transfer-orders/hooks/useTransferOrders';
import { useTransferOrder } from '@/features/transfer-orders/hooks/useTransferOrder';
import {
  useCancelTransferOrder,
  useCloseIncompleteTransferOrder,
  useCreateTransferOrder,
  useExecuteTransferOrder,
  type ExecuteTransferOrderBody,
  useIssueTransferOrder,
  useUpdateTransferOrderDraft
} from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import type { EmitTransferOrderPayload, TransferOrder } from '@/features/transfer-orders/types';
import { signatureOfOrder, signatureOfPayload } from './useTransferOrderDraft';

/** Runs a mutation, answering null on failure: the mutation already told the user why. */
const run = async <T,>(action: () => Promise<T>): Promise<T | null> => {
  try {
    return await action();
  } catch {
    return null;
  }
};

/**
 * The transfer order the screen is bound to, and everything the screen can do with it.
 *
 * On arrival the screen binds itself to the order asked for in the URL or, failing that, to the
 * most recent draft or open order of the source batch: what was prepared yesterday has to be
 * found again today, not built twice. Only once — discarding an order must not have the screen
 * jump to another one.
 *
 * A draft keeps the screen editable; `isDirty` says whether what the screen shows differs from
 * what the draft saved. An issued order freezes it.
 */
export function useTransferOrderSession(
  sourceBatchId: number,
  requestedOrderId: number | null,
  /** What the screen would save right now, or null when it is not a valid order yet. */
  currentPayload: EmitTransferOrderPayload | null
) {
  const { activeCompanyId } = useCompany();
  const queryClient = useQueryClient();
  const { data: batchOrders = [] } = useTransferOrders({ sourceBatchId });
  const [orderId, setOrderId] = useState<number | null>(requestedOrderId);
  const didPick = useRef(requestedOrderId != null);
  const hydratedId = useRef<number | null>(null);

  useEffect(() => {
    if (didPick.current || batchOrders.length === 0) return;

    didPick.current = true;
    const current = batchOrders.find((candidate) => candidate.is_editable || candidate.is_open);

    if (current) setOrderId(current.id);
  }, [batchOrders]);

  const { data: fetched } = useTransferOrder(orderId);
  const order: TransferOrder | null = fetched && fetched.id === orderId ? fetched : null;

  const createMutation = useCreateTransferOrder();
  const updateMutation = useUpdateTransferOrderDraft();
  const issueMutation = useIssueTransferOrder();
  const cancelMutation = useCancelTransferOrder();
  const closeMutation = useCloseIncompleteTransferOrder();
  const executeMutation = useExecuteTransferOrder();

  /** Seeds the detail cache so the band shows at once, without refilling the screen from it. */
  const adopt = useCallback(
    (saved: TransferOrder) => {
      queryClient.setQueryData([TRANSFER_ORDERS_KEY, activeCompanyId, 'detail', saved.id], saved);
      hydratedId.current = saved.id;
      didPick.current = true;
      setOrderId(saved.id);
    },
    [queryClient, activeCompanyId]
  );

  /** "Guardar borrador" (issue = false) or "Crear y emitir orden" (issue = true). */
  const create = useCallback(
    async (issue: boolean): Promise<TransferOrder | null> => {
      if (!currentPayload) return null;

      const saved = await run(() => createMutation.mutateAsync({ ...currentPayload, issue }));

      if (saved) adopt(saved);

      return saved;
    },
    [currentPayload, createMutation, adopt]
  );

  const isDraft = order?.is_editable ?? false;
  const isDirty = isDraft && order != null && (!currentPayload || signatureOfPayload(currentPayload) !== signatureOfOrder(order));

  /** "Guardar cambios" on the draft. */
  const saveChanges = useCallback(async (): Promise<TransferOrder | null> => {
    if (!order || !currentPayload) return null;

    const saved = await run(() => updateMutation.mutateAsync({ id: order.id, payload: currentPayload }));

    if (saved) adopt(saved);

    return saved;
  }, [order, currentPayload, updateMutation, adopt]);

  /** "Emitir orden": saves what is pending first, so what gets issued is what the screen shows. */
  const issue = useCallback(async (): Promise<TransferOrder | null> => {
    if (!order) return null;

    if (isDirty && !(await saveChanges())) return null;

    const issued = await run(() => issueMutation.mutateAsync(order.id));

    if (issued) adopt(issued);

    return issued;
  }, [order, isDirty, saveChanges, issueMutation, adopt]);

  /**
   * Discarding a draft or "Anular y volver a armar": the order goes, with its reason when it has
   * one; the screen stays, editable, with the same selection.
   */
  const cancel = useCallback(
    async (reason: string | null): Promise<boolean> => {
      if (!order) return false;

      const done = await run(() => cancelMutation.mutateAsync({ id: order.id, reason }));

      if (done) setOrderId(null);

      return done != null;
    },
    [order, cancelMutation]
  );

  const closeIncomplete = useCallback(
    async (reason: string): Promise<boolean> => {
      if (!order) return false;

      return (await run(() => closeMutation.mutateAsync({ id: order.id, reason }))) != null;
    },
    [order, closeMutation]
  );

  const execute = useCallback(
    async (body?: ExecuteTransferOrderBody): Promise<boolean> =>
      order ? (await run(() => executeMutation.mutateAsync({ id: order.id, body }))) != null : false,
    [order, executeMutation]
  );

  const shouldHydrate = useCallback(
    (candidate: TransferOrder): boolean =>
      (candidate.is_open || candidate.is_editable) && hydratedId.current !== candidate.id,
    []
  );

  const markHydrated = useCallback((id: number) => {
    hydratedId.current = id;
  }, []);

  return {
    order,
    isDraft,
    isDirty,
    /** An issued or partial order freezes the selection and the destinations. */
    isLocked: order?.is_open ?? false,
    otherOpenCount: batchOrders.filter((candidate) => candidate.is_open && candidate.id !== orderId).length,
    create,
    saveChanges,
    issue,
    cancel,
    closeIncomplete,
    execute,
    shouldHydrate,
    markHydrated,
    isBusy:
      createMutation.isPending ||
      updateMutation.isPending ||
      issueMutation.isPending ||
      cancelMutation.isPending ||
      closeMutation.isPending ||
      executeMutation.isPending,
    isExecuting: executeMutation.isPending
  };
}

export type TransferOrderSession = ReturnType<typeof useTransferOrderSession>;

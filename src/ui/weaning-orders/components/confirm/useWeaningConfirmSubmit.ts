import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { weaningOrderErrorMessage } from '@/features/weaning-orders/types';
import {
  useCreateWeaningOrder,
  useExecuteWeaningOrder,
  useIssueWeaningOrder,
  useRegisterWeaning,
  useUpdateWeaningOrderDraft
} from '@/features/weaning-orders/hooks/useWeaningOrderMutations';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';

interface RowErrorBody {
  row_errors?: { caravana: string; errors: { message: string }[] }[];
}

/**
 * What the confirmation modal sends: a new order or a draft, saved or issued; a weaning that already
 * happened, born executed; or the calves of an open order ("Registrar destetadas"), which executes
 * that order. Problems are told on click, the server's answer is kept to be shown in the modal.
 */
export function useWeaningConfirmSubmit(form: WeaningOrderFormState, draftId: number | null) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const create = useCreateWeaningOrder();
  const update = useUpdateWeaningOrderDraft();
  const issue = useIssueWeaningOrder();
  const register = useRegisterWeaning();
  const execute = useExecuteWeaningOrder();
  const mutations = [create, update, issue, register, execute];

  const failed = create.error ?? update.error ?? issue.error ?? register.error ?? execute.error;
  const rowErrors = (failed as { response?: { data?: RowErrorBody } } | null)?.response?.data?.row_errors ?? [];
  const errorText = !failed
    ? null
    : rowErrors.length > 0
      ? rowErrors.map((row) => `${row.caravana}: ${row.errors.map((e) => e.message).join(' ')}`).join(' · ')
      : weaningOrderErrorMessage(failed, 'No se pudo guardar el destete');

  const done = (orderId: number) => navigate(`/weaning-orders?orderId=${orderId}`);

  const ready = () => {
    if (form.problems.length === 0) return true;

    enqueueSnackbar(form.problems[0], { variant: 'warning' });

    return false;
  };

  const saveOrder = (andIssue: boolean) => {
    if (!ready()) return;

    if (draftId) {
      update.mutate(
        { id: draftId, payload: form.toOrderPayload(false) },
        { onSuccess: (order) => (andIssue ? issue.mutate(order.id, { onSuccess: () => done(order.id) }) : done(order.id)) }
      );
      return;
    }

    create.mutate(form.toOrderPayload(andIssue), { onSuccess: (order) => done(order.id) });
  };

  const registerWeaning = () => {
    if (!ready()) return;

    const source = form.sourceOrder;

    if (source) {
      execute.mutate(
        { id: source.id, body: form.toExecuteBody() },
        { onSuccess: () => (form.returnTo ? navigate(form.returnTo) : done(source.id)) }
      );
      return;
    }

    register.mutate(form.toRegisterPayload(), { onSuccess: ({ order }) => done(order.id) });
  };

  return {
    saveOrder,
    registerWeaning,
    errorText,
    isPending: mutations.some((m) => m.isPending),
    reset: () => mutations.forEach((m) => m.reset())
  };
}

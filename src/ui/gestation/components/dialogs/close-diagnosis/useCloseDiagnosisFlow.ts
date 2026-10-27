import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ServiceOrder, useCloseServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import { todayIso } from '@/ui/gestation/utils/reproductiveVerdict';
import { apiErrorData } from '@/ui/gestation/utils/apiError';
import type { DiagnosisEntryState } from '../../diagnosis-entry/diagnosisEntryModel';
import { useDiagnosisRoundContext } from '../../diagnosis-entry/useDiagnosisRoundContext';
import { useNotInseminated } from '../../insemination-entry/useNotInseminated';
import { ClosingDecisions, CloseStep, buildClosePayload, decisionsProblem, projectClosing } from './closeDiagnosisModel';

const NO_ENTRIES: DiagnosisEntryState = {};

interface CloseFlowOptions {
  /** Verdicts stated in "Cargar tacto" (close mode): sent with the closing, in the same request. */
  entries?: DiagnosisEntryState;
  /** The day of those verdicts, which is the closing day. Without verdicts it is chosen here. */
  closingDate?: string;
  onDone: () => void;
  /** The backend found females still pending on the closing day. */
  onPending: (femaleIds: number[], message: string) => void;
}

/**
 * State and actions of "Cerrar orden": 1) read-only confirmation, 2) the bulls (only while they
 * are still in the batch). The missing verdicts were loaded before, in "Cargar tacto"; everything
 * is sent at once.
 */
export function useCloseDiagnosisFlow(order: ServiceOrder, { entries = NO_ENTRIES, closingDate, onDone, onPending }: CloseFlowOptions) {
  const { enqueueSnackbar } = useSnackbar();
  const ctx = useDiagnosisRoundContext(order);
  const closeMutation = useCloseServiceOrderDiagnosis();

  const [step, setStep] = useState<CloseStep>('confirm');
  const [decisions, setDecisions] = useState<ClosingDecisions>(() => ({
    closingDate: closingDate ?? todayIso(),
    observations: '',
    emptiesTargetBatchId: null,
    bullAction: null,
    bullDestinationBatchId: null,
    scheduledMovementDate: closingDate ?? todayIso(),
    remainingAction: null,
    remainingTargetBatchId: null,
  }));

  // AI (semen S-B): the never inseminated are neither scanned nor counted (IA12); they only get an optional note.
  const females = useMemo(() => (ctx.diagnosis?.females ?? []).filter((f) => !f.is_not_inseminated), [ctx.diagnosis]);
  const notInseminated = useNotInseminated(order);
  const needsBullDecision = order.status === 'APPROVED' && ctx.activeBullIds.length > 0;
  const projection = useMemo(
    () => projectClosing(females, entries, decisions.closingDate, order.batch_id),
    [females, entries, decisions.closingDate, order.batch_id]
  );

  const updateDecisions = (patch: Partial<ClosingDecisions>) => setDecisions((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    const problem = decisionsProblem(decisions, needsBullDecision, projection);
    if (problem) {
      enqueueSnackbar(problem, { variant: 'warning' });
      return;
    }

    try {
      const result = await closeMutation.mutateAsync({
        id: order.id,
        payload: { ...buildClosePayload(entries, decisions, needsBullDecision, projection), not_inseminated_reasons: notInseminated.payload() },
      });
      const extras = [
        result.continuation_order && `continúa en la orden ${result.continuation_order.code}`,
        result.transfer_order && `traslado de toros programado (${result.transfer_order.code})`,
      ].filter(Boolean);
      enqueueSnackbar(`Orden ${order.code} cerrada con su diagnóstico${extras.length ? `: ${extras.join(', ')}` : ''}.`, {
        variant: 'success',
      });
      onDone();
    } catch (error) {
      const data = apiErrorData(error);
      if (data.code === 'PENDING_DIAGNOSES') {
        onPending(data.pending_female_ids ?? [], data.message || 'Faltan diagnósticos para cerrar la orden.');
        return;
      }
      enqueueSnackbar(data.message || 'No se pudo cerrar la orden.', { variant: data.code ? 'warning' : 'error' });
    }
  };

  return {
    ctx,
    step,
    setStep,
    decisions,
    updateDecisions,
    projection,
    needsBullDecision,
    /** The closing day can be chosen only when no verdicts came with it. */
    canChooseDate: closingDate === undefined,
    submit,
    notInseminated,
    isSubmitting: closeMutation.isPending,
  };
}

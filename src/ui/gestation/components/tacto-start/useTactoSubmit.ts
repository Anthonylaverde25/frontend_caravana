import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import {
  type DiagnosisFemale,
  type ServiceOrder,
  useBulkRegisterGestationDiagnosis,
  useMarkNotDiagnosed,
} from '@/features/gestation/hooks/useServiceOrders';
import { type DiagnosisEntryState, entryOf, isPendingOn, toPayload } from '../diagnosis-entry/diagnosisEntryModel';
import type { DiagnosisEntryController } from '../diagnosis-entry/useDiagnosisEntryState';
import { formatDay } from '../../utils/reproductiveVerdict';
import { tactoRowErrors } from './tactoErrors';
import type { TactoMode } from './tactoStart';

interface TactoSubmitInput {
  order: ServiceOrder | null;
  mode: TactoMode;
  roundDate: string;
  returnTo: string;
  females: DiagnosisFemale[];
  entry: DiagnosisEntryController;
}

/**
 * What the round sends and how. A female left "Sin tactar" is not sent. "round" saves the stated
 * rows; "close" requires a result for every pending female and hands the rows to the closing,
 * which sends them with it. Validated on click; the backend answer is painted on its rows.
 */
export function useTactoSubmit({ order, mode, roundDate, returnTo, females, entry }: TactoSubmitInput) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const register = useBulkRegisterGestationDiagnosis();
  const markNotDiagnosed = useMarkNotDiagnosed();
  const [closingEntries, setClosingEntries] = useState<DiagnosisEntryState | null>(null);

  const pendingIds = useMemo(
    () => females.filter((female) => isPendingOn(female, roundDate)).map((female) => female.female_caravan_id),
    [females, roundDate]
  );
  const statedIds = females.map((f) => f.female_caravan_id).filter((id) => entryOf(entry.values, id).result !== 'UNCHECKED');
  const counts = { pregnant: 0, empty: 0, notDiagnosed: 0 };
  statedIds.forEach((id) => {
    const result = entryOf(entry.values, id).result;
    if (result === 'PREGNANT') counts.pregnant++;
    else if (result === 'EMPTY') counts.empty++;
    else counts.notDiagnosed++;
  });
  const missingToClose = pendingIds.filter((id) => entryOf(entry.values, id).result === 'UNCHECKED').length;

  /** The rows to send, or null (rows flagged) when something is missing. */
  const rowsToSend = (): DiagnosisEntryState | null => {
    const ids = mode === 'close' ? [...new Set([...pendingIds, ...statedIds])] : statedIds;
    if (mode === 'round' && ids.length === 0) {
      enqueueSnackbar('Marcá el resultado de al menos un vientre.', { variant: 'warning' });
      return null;
    }
    if (!entry.validate(ids, mode === 'close')) {
      enqueueSnackbar(
        missingToClose > 0 && mode === 'close'
          ? `Faltan ${missingToClose} vientre(s) pendientes sin resultado: cargalo o declaralo "Sin diagnóstico".`
          : 'Revisá las filas marcadas en rojo.',
        { variant: 'warning' }
      );
      return null;
    }
    return Object.fromEntries(ids.map((id) => [id, entryOf(entry.values, id)]));
  };

  const save = async () => {
    const rows = rowsToSend();
    if (!rows || !order) return;
    const { diagnoses, notDiagnosed } = toPayload(rows);
    try {
      if (diagnoses.length > 0) {
        await register.mutateAsync(diagnoses.map((d) => ({ ...d, service_order_id: order.id, diagnosis_date: roundDate })));
      }
      if (notDiagnosed.length > 0) {
        await markNotDiagnosed.mutateAsync({ id: order.id, roundDate, females: notDiagnosed });
      }
      enqueueSnackbar(`${Object.keys(rows).length} vientre(s) registrados en la ronda del ${formatDay(roundDate)}.`, { variant: 'success' });
      navigate(returnTo);
    } catch (error) {
      const { byFemale, general } = tactoRowErrors(error, diagnoses.map((d) => d.caravan_id), females);
      entry.flagEach(byFemale);
      enqueueSnackbar(general ?? 'Revisá las filas marcadas en rojo.', { variant: 'error' });
    }
  };

  const continueToClosing = () => {
    const rows = rowsToSend();
    if (rows) setClosingEntries(rows);
  };

  return {
    submit: mode === 'close' ? continueToClosing : save,
    closingEntries,
    cancelClosing: () => setClosingEntries(null),
    onPendingRejected: (ids: number[], message: string) => {
      setClosingEntries(null);
      entry.flag(ids, 'Falta el diagnóstico');
      enqueueSnackbar(message, { variant: 'warning' });
    },
    statedCount: statedIds.length,
    counts,
    missingToClose,
    pendingCount: pendingIds.length,
    isSaving: register.isPending || markNotDiagnosed.isPending,
  };
}

import { useSnackbar } from 'notistack';
import { useConfirmPaternities } from '@/features/paternity/hooks/useConfirmPaternities';
import { toConfirmations } from './paternityModel';
import type { PaternityController } from './usePaternityState';

/**
 * "Confirmar paternidades": validates on click, sends the calves with a sire chosen and paints the
 * backend answer on their rows ("confirmations.3.father_id").
 */
export function usePaternitySubmit(state: PaternityController) {
  const { enqueueSnackbar } = useSnackbar();
  const mutation = useConfirmPaternities();
  const confirmations = toConfirmations(state.values);

  const submit = () => {
    if (!state.validate()) {
      enqueueSnackbar('Hay crías con datos incompletos: revisá las filas marcadas.', { variant: 'warning' });
      return;
    }
    if (confirmations.length === 0) {
      enqueueSnackbar('Elegí el padre y el método de al menos una cría.', { variant: 'warning' });
      return;
    }

    mutation.mutate(confirmations, {
      onSuccess: (result) => {
        enqueueSnackbar(`${result.confirmed} paternidad(es) confirmada(s).`, { variant: 'success' });
        result.warnings.forEach((warning) => enqueueSnackbar(warning.message, { variant: 'warning' }));
        state.reset();
      },
      onError: (error: any) => {
        const serverErrors: Record<string, string[]> = error?.response?.data?.errors ?? {};
        const byCalf: Record<number, string> = {};
        Object.entries(serverErrors).forEach(([key, messages]) => {
          const match = /^confirmations\.(\d+)\./.exec(key);
          const row = match ? confirmations[Number(match[1])] : undefined;
          if (row) byCalf[row.calf_id] = messages[0];
        });
        state.flagEach(byCalf);
        enqueueSnackbar(error?.response?.data?.message ?? 'No se pudieron confirmar las paternidades.', { variant: 'error' });
      },
    });
  };

  return { submit, count: confirmations.length, isSaving: mutation.isPending };
}

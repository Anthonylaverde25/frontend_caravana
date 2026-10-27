import { useSnackbar } from 'notistack';
import { useRegisterInseminations } from '@/features/gestation/hooks/useInseminations';
import type { InseminationRowPayload } from '@/features/gestation/types/insemination';
import { missingOf, type InseminationFemale } from './inseminationEntryModel';
import type { InseminationEntryController } from './useInseminationEntryState';

/**
 * "Registrar inseminaciones": the marked rows go together; what the server objects to comes back on
 * its cell (rows.{i}.field), never validated live. Only an unchosen semen or lot is caught before.
 */
export function useInseminationSubmit(orderId: number, females: InseminationFemale[], entry: InseminationEntryController) {
  const { enqueueSnackbar } = useSnackbar();
  const mutation = useRegisterInseminations();
  const rowsToSend = females.filter((f) => entry.selected.has(f.id) && entry.editable.has(f.id));

  const submit = () => {
    if (rowsToSend.length === 0) {
      enqueueSnackbar('Marcá al menos un vientre para registrar.', { variant: 'warning' });
      return;
    }
    const missing: Record<number, Record<string, string>> = {};
    rowsToSend.forEach((f) => {
      const problems = missingOf(entry.drafts[f.id]);
      if (Object.keys(problems).length > 0) missing[f.id] = problems;
    });
    if (Object.keys(missing).length > 0) {
      entry.setErrors(missing);
      enqueueSnackbar(`Faltan datos en ${Object.keys(missing).length} fila(s): están marcadas en rojo.`, { variant: 'warning' });
      return;
    }

    const rows: InseminationRowPayload[] = rowsToSend.map((f) => {
      const d = entry.drafts[f.id];
      return {
        female_caravan_id: f.id,
        inseminated_on: d.date,
        item_id: d.itemId as number,
        semen_lot_id: d.lot === 'NONE' ? null : (d.lot as number),
        straws_used: d.straws,
        warehouse_id: d.warehouseId as number,
        notes: d.notes.trim() || null,
      };
    });

    mutation.mutate(
      { orderId, rows, idempotencyKey: crypto.randomUUID() },
      {
        onSuccess: (result) => {
          const docs = result.documents.map((d) => `N.º ${d.number}${d.warehouse?.code ? ` (${d.warehouse.code})` : ''}`).join(', ');
          enqueueSnackbar(`${rows.length} inseminación(es) registradas. Consumo ${docs}.`, { variant: 'success' });
          if (result.incidents.length > 0) {
            enqueueSnackbar('Quedaron novedades de stock (partida sin identificar o saldo negativo): revisalas en Ítems.', { variant: 'warning' });
          }
          entry.reset();
        },
        onError: (error: any) => {
          const serverErrors: Record<string, string[]> = error?.response?.data?.errors ?? {};
          const byFemale: Record<number, Record<string, string>> = {};
          Object.entries(serverErrors).forEach(([key, messages]) => {
            const match = /^rows\.(\d+)\.(.+)$/.exec(key);
            const row = match ? rows[Number(match[1])] : undefined;
            if (row) byFemale[row.female_caravan_id] = { ...(byFemale[row.female_caravan_id] ?? {}), [match![2]]: messages[0] };
          });
          entry.setErrors(byFemale);
          enqueueSnackbar(error?.response?.data?.message ?? 'No se pudieron registrar las inseminaciones.', { variant: 'error' });
        },
      }
    );
  };

  return { submit, count: rowsToSend.length, isSaving: mutation.isPending };
}

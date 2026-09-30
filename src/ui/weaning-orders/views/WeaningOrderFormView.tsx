import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import { useWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrder';
import {
  useCreateWeaningOrder,
  useIssueWeaningOrder,
  useRegisterWeaning,
  useUpdateWeaningOrderDraft
} from '@/features/weaning-orders/hooks/useWeaningOrderMutations';
import { useWeaningOrderForm, WeaningFormMode, WeaningOrderStart } from '../hooks/useWeaningOrderForm';
import WeaningOrderSummaryCard from '../components/confirm/WeaningOrderSummaryCard';
import WeaningCalvesSection from '../components/form/WeaningCalvesSection';
import type { WeaningBatchOption } from '../components/start/WeaningBatchSelectField';

interface RowErrorBody {
  row_errors?: { caravana: string; errors: { message: string }[] }[];
}

/**
 * The confirmation of "Nueva orden de destete" and "Registrar destete" (`…/confirm`). The order as
 * a whole was declared in the start dialog and is shown read-only ("Editar" goes back to it); here
 * only the calves are confirmed, plus what the order asks calf by calf.
 *
 * It starts from the dialog (navigation state), or from a draft (`?orderId=`). Without either it
 * goes back to the dialog: there is nothing to confirm.
 */
export const WeaningOrderFormView: React.FC<{ mode: WeaningFormMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const form = useWeaningOrderForm(mode);
  const { data: births = [], isLoading } = useBirthHistory();
  const { data: batches = [] } = useBatches(undefined, 'WEANING');
  const draftId = mode === 'order' ? Number(searchParams.get('orderId')) || null : null;
  const { data: draft } = useWeaningOrder(draftId);
  const startPath = mode === 'register' ? '/weaning-orders/register' : '/weaning-orders/new';

  const create = useCreateWeaningOrder();
  const update = useUpdateWeaningOrderDraft();
  const issue = useIssueWeaningOrder();
  const register = useRegisterWeaning();

  const recordsById = useMemo(() => new Map(births.map((b) => [b.calf_id, b])), [births]);
  const sexById = useMemo(() => {
    const byId: Record<number, 'M' | 'H' | null> = {};
    births.forEach((b) => {
      byId[b.calf_id] = b.calf_sex === 'M' || b.calf_sex === 'H' ? b.calf_sex : null;
    });

    return byId;
  }, [births]);
  const batchesById = useMemo(
    () =>
      new Map<number, WeaningBatchOption>(
        batches.map((b) => [Number(b.id), { id: Number(b.id), name: b.name, caravans_count: b.caravans_count, is_confined: b.is_confined }])
      ),
    [batches]
  );

  // Applied once: what the start dialog declared, or the draft being reopened.
  const start = location.state as WeaningOrderStart | null;
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;

    if (start?.calfIds) {
      initialized.current = true;
      form.applyStart(start);
      return;
    }

    if (draftId) {
      if (draft) {
        initialized.current = true;
        form.hydrate(draft);
      }

      return;
    }

    initialized.current = true;
    navigate(startPath, { replace: true });
  }, [draft, draftId]);

  const destinationLabels = useMemo(
    () =>
      new Map(form.activeDestinations.map((d) => [d.key, d.kind === 'new' ? d.name.trim() : (batchesById.get(d.batchId ?? -1)?.name ?? '')])),
    [form.activeDestinations, batchesById]
  );

  const rodeos = useMemo(
    () => [...new Set(form.calfIds.map((id) => recordsById.get(id)?.calf_batch_name ?? 'Sin lote'))],
    [form.calfIds, recordsById]
  );

  const failed = register.error ?? create.error ?? update.error;
  const errorsByTag = useMemo(() => {
    const byTag: Record<string, string[]> = {};
    ((failed as { response?: { data?: RowErrorBody } } | null)?.response?.data?.row_errors ?? []).forEach((row) => {
      byTag[row.caravana.toUpperCase()] = row.errors.map((e) => e.message);
    });

    return byTag;
  }, [failed]);

  const isPending = create.isPending || update.isPending || issue.isPending || register.isPending;
  const done = (orderId: number) => navigate(`/weaning-orders?orderId=${orderId}`);

  const saveOrder = (andIssue: boolean) => {
    if (draftId) {
      update.mutate(
        { id: draftId, payload: form.toOrderPayload(false) },
        { onSuccess: (order) => (andIssue ? issue.mutate(order.id, { onSuccess: () => done(order.id) }) : done(order.id)) }
      );
      return;
    }

    create.mutate(form.toOrderPayload(andIssue), { onSuccess: (order) => done(order.id) });
  };

  return (
    <ViewLayout
      title={mode === 'register' ? 'Confirmar destete registrado' : draftId ? `Borrador ${draft?.code ?? ''}` : 'Confirmar orden de destete'}
      subtitle={
        mode === 'register'
          ? 'Revisá las crías: el destete queda registrado con su orden, ejecutada en la fecha en que ocurrió.'
          : 'Revisá las crías antes de emitir. La orden se cumple en la manga con la planilla DEST-01, o desde esta bandeja.'
      }
      backUrl="/weaning-orders"
      backTitle="Órdenes de destete"
    >
      {isLoading || !initialized.current ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack spacing={2}>
          <WeaningOrderSummaryCard
            form={form}
            batchesById={batchesById}
            rodeos={rodeos}
            onEdit={() => navigate(startPath, { state: form.toStart(draftId, draft?.code ?? null) })}
          />
          <WeaningCalvesSection
            form={form}
            recordsById={recordsById}
            sexById={sexById}
            destinationLabels={destinationLabels}
            errorsByTag={errorsByTag}
          />

          {form.problems.length > 0 && (
            <Alert severity="info" sx={{ borderRadius: '6px' }}>
              {form.problems.join(' ')}
            </Alert>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => navigate('/weaning-orders')} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
              Cancelar
            </Button>
            {mode === 'order' ? (
              <>
                <Button
                  variant="outlined"
                  disabled={isPending || form.problems.length > 0}
                  onClick={() => saveOrder(false)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
                >
                  {draftId ? 'Guardar cambios' : 'Guardar borrador'}
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={isPending || form.problems.length > 0}
                  onClick={() => saveOrder(true)}
                  startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:paper-airplane</FuseSvgIcon>}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
                >
                  {draftId ? 'Guardar y emitir' : 'Crear y emitir orden'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                disableElevation
                disabled={isPending || form.problems.length > 0}
                onClick={() => register.mutate(form.toRegisterPayload(), { onSuccess: ({ order }) => done(order.id) })}
                startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
              >
                Registrar destete de {form.calfIds.length} cría(s)
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ViewLayout>
  );
};

export default WeaningOrderFormView;

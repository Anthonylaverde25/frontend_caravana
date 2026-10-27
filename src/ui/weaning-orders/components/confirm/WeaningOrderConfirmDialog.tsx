import React, { useEffect, useMemo } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import { useWeaningOrderForm, WeaningFormMode, WeaningOrderStart } from '../../hooks/useWeaningOrderForm';
import WeaningOrderConfirmSummary, { ConfirmDestinationLine } from './WeaningOrderConfirmSummary';
import { useWeaningConfirmSubmit } from './useWeaningConfirmSubmit';

interface WeaningOrderConfirmDialogProps {
  mode: WeaningFormMode;
  /** What the start dialog declared; null while closed. */
  start: WeaningOrderStart | null;
  /** "Registrar destetadas": what differs from the order being executed, e.g. "el destino". */
  deviations?: string[];
  /** "Volver": back to the start dialog, with everything still declared there. */
  onClose: () => void;
}

const primarySx = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  px: 3.5,
  fontWeight: 700,
  borderRadius: '6px',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': { bgcolor: 'primary.dark' }
} as const;

/**
 * The confirmation over the start dialog, read back as a whole — calves, destination, type, what
 * will happen. A new order (or a draft) is saved or issued; a weaning that already happened is
 * registered, born executed, or executes the open order its calves come from. Nothing is edited
 * here; "Volver" goes back to the dialog that declared it.
 */
export const WeaningOrderConfirmDialog: React.FC<WeaningOrderConfirmDialogProps> = ({ mode, start, deviations = [], onClose }) => {
  const form = useWeaningOrderForm(mode);
  const { data: births = [] } = useBirthHistory();
  const { data: batches = [] } = useBatches(undefined, undefined, 'own');
  const draftId = start?.orderId ?? null;
  const submit = useWeaningConfirmSubmit(form, draftId);
  const register = mode === 'register';
  const source = start?.sourceOrder ?? null;

  useEffect(() => {
    if (!start) return;

    form.applyStart(start);
    submit.reset();
  }, [start]);

  const records = useMemo(() => {
    const byId = new Map(births.map((b) => [b.calf_id, b]));

    return form.calfIds.map((id) => byId.get(id)).filter((b) => b !== undefined);
  }, [births, form.calfIds]);

  const destinations = useMemo<ConfirmDestinationLine[]>(() => {
    const nameOf = new Map(batches.map((b) => [Number(b.id), b.name]));
    const single = form.destinationMode === 'single';

    return form.activeDestinations.map((d) => ({
      key: d.key,
      kind: d.kind,
      label: d.kind === 'stay' ? 'Quedan en su lote' : d.kind === 'new' ? d.name.trim() : (nameOf.get(d.batchId ?? -1) ?? `Lote ${d.batchId}`),
      count: single ? form.calfIds.length : form.calfIds.filter((id) => form.calves[id]?.destinationKey === d.key).length
    }));
  }, [form.activeDestinations, form.destinationMode, form.calfIds, form.calves, batches]);
  const atChuteCount = form.destinationMode === 'single' ? 0 : form.calfIds.filter((id) => !form.calves[id]?.destinationKey).length;
  // "Registrar destetadas": the calves of the order left pending after these.
  const remainingCount = source ? births.filter((b) => b.open_order_code === source.code && !form.calfIds.includes(b.calf_id)).length : 0;
  const weighedCount = form.calfIds.filter((id) => (form.calves[id]?.weight.trim() ?? '') !== '').length;

  const title = source
    ? `Registrar destetadas · ${source.code}`
    : register
      ? 'Registrar destete'
      : draftId
        ? `Confirmar borrador ${start?.orderCode ?? ''}`.trim()
        : 'Confirmar orden de destete';

  return (
    <Dialog
      open={start !== null}
      onClose={submit.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {register ? 'El destete ya ocurrió: revisá lo que se va a registrar. Para cambiar algo, volvé.' : 'Revisá lo que dice la orden antes de emitirla. Para cambiar algo, volvé.'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={submit.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {deviations.length > 0 && (
          <Alert severity="warning" sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.5 }}>
            Difiere de lo planificado en {source?.code}: {deviations.join(' y ')}. Queda registrado en la orden como desvío.
          </Alert>
        )}

        <WeaningOrderConfirmSummary
          form={form}
          males={records.filter((r) => r.calf_sex === 'M').length}
          females={records.filter((r) => r.calf_sex === 'H').length}
          rodeos={[...new Set(records.map((r) => r.calf_batch_name ?? 'Sin lote'))]}
          destinations={destinations}
          atChuteCount={atChuteCount}
          weighedCount={weighedCount}
          sourceCode={source?.code ?? null}
          remainingCount={remainingCount}
        />

        {submit.errorText && (
          <Alert severity="error" sx={{ borderRadius: '6px', fontSize: '0.8rem' }}>
            {submit.errorText}
          </Alert>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          px: 3,
          bgcolor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Button variant="text" onClick={onClose} disabled={submit.isPending} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Volver
        </Button>
        {register ? (
          <Button
            variant="contained"
            onClick={submit.registerWeaning}
            disabled={submit.isPending}
            startIcon={submit.isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
            sx={primarySx}
          >
            {source ? `Registrar ${form.calfIds.length} destetada(s)` : `Registrar destete de ${form.calfIds.length} cría(s)`}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => submit.saveOrder(false)}
              disabled={submit.isPending}
              sx={{ fontWeight: 600, borderRadius: '6px', textTransform: 'none' }}
            >
              {draftId ? 'Guardar cambios' : 'Guardar borrador'}
            </Button>
            <Button
              variant="contained"
              onClick={() => submit.saveOrder(true)}
              disabled={submit.isPending}
              startIcon={
                submit.isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:paper-airplane</FuseSvgIcon>
              }
              sx={primarySx}
            >
              {draftId ? 'Guardar y emitir' : 'Crear y emitir'}
            </Button>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default WeaningOrderConfirmDialog;

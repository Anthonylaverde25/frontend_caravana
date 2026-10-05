import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useReceiveEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage, type EntryOrder, type EntryOrderDte } from '@/features/entry-orders/types';
import DiscardChangesDialog from '../DiscardChangesDialog';
import ReceptionCaravanList from './ReceptionCaravanList';
import { useReceptionDraft } from './useReceptionDraft';

interface ReceiveDteDialogProps {
  order: EntryOrder;
  /** One DTE ("Recibir" on it), every DTE with caravans in transit ("Recibir todo"), or null when closed. */
  dtes: EntryOrderDte[] | null;
  onClose: () => void;
}

const filledSx = { bgcolor: 'action.hover' } as const;

/**
 * "Recibir" on one DTE, or "Recibir todo" on all of them at once: the truck arrived. The caravans still in transit come ticked; the user
 * unticks the ones that did not come and says whether they arrive later or never. It can be done
 * in parts: "Recibir" stays while the DTE has caravans in transit.
 */
export const ReceiveDteDialog: React.FC<ReceiveDteDialogProps> = ({ order, dtes, onClose }) => {
  const receive = useReceiveEntryOrder();
  const draft = useReceptionDraft();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [reasonMissing, setReasonMissing] = useState(false);
  // Opening already ticks everything: only what the user changed counts as work to lose.
  const isDirty = draft.lines.some((line) => !line.checked || line.weight !== '') || draft.reason.trim() !== '';

  const requestClose = () => {
    if (receive.isPending) return;
    if (isDirty) setConfirmingClose(true);
    else onClose();
  };
  const today = new Date().toISOString().slice(0, 10);

  const single = dtes?.length === 1 ? dtes[0] : null;
  const openKey = dtes?.map((d) => d.id).join(',') ?? '';

  useEffect(() => {
    if (dtes) draft.reset(dtes);
    setReasonMissing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey]);

  const submit = () => {
    if (!dtes) return;

    // Told on click, not by a disabled button: the theme paints a disabled button like an active one.
    if (draft.counts.received + draft.counts.missing === 0) {
      draft.setHeaderError('Tildá al menos una caravana recibida, o marcá las que no van a llegar.');
      return;
    }
    if (draft.counts.missing > 0 && draft.reason.trim().length < 3) {
      draft.setHeaderError(null);
      setReasonMissing(true);
      return;
    }

    draft.setRowErrors([]);
    draft.setHeaderError(null);
    receive.mutate(
      { id: order.id, payload: draft.payload(single?.id ?? null) },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          const body = entryOrderApiError(error);

          draft.setRowErrors(body?.row_errors ?? []);
          draft.setHeaderError(body?.header_errors?.[0]?.message ?? (body?.row_errors?.length ? null : (body?.message ?? null)));
          toast.error(entryOrderErrorMessage(error, 'No se pudo registrar la recepción'));
        }
      }
    );
  };

  return (
    <Dialog open={dtes != null} onClose={requestClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {single ? `Recibir DTE ${single.dte_number}` : 'Recibir todo'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.code}
            {!single && dtes ? ` · ${dtes.length} DTE` : ''} · {draft.lines.length} {draft.lines.length === 1 ? 'caravana en tránsito' : 'caravanas en tránsito'}
          </Typography>
        </Box>
        <IconButton onClick={requestClose} size="small" disabled={receive.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Fecha de recepción"
            type="date"
            required
            variant="filled"
            value={draft.receivedAt}
            onChange={(e) => draft.setReceivedAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: today, min: dtes?.map((d) => d.dte_date).sort().at(-1) }}
            sx={filledSx}
          />
          {draft.headerError && (
            <Alert severity="error" sx={{ borderRadius: '6px' }}>
              {draft.headerError}
            </Alert>
          )}
          <ReceptionCaravanList draft={draft} showDte={!single} />
          {draft.counts.missing > 0 && (
            <TextField
              label="Motivo (obligatorio)"
              required
              multiline
              minRows={2}
              variant="filled"
              value={draft.reason}
              onChange={(e) => draft.setReason(e.target.value)}
              error={reasonMissing && draft.reason.trim().length < 3}
              autoFocus={reasonMissing}
              helperText={
                reasonMissing && draft.reason.trim().length < 3
                  ? 'Indicá por qué no van a llegar.'
                  : 'Las que no van a llegar quedan registradas y generan una novedad para revisar con el proveedor.'
              }
              sx={filledSx}
            />
          )}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Recibís {draft.counts.received} · Llega después {draft.counts.later} · No llegará {draft.counts.missing}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={requestClose} disabled={receive.isPending} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={receive.isPending}
          onClick={submit}
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
        >
          {receive.isPending ? 'Registrando…' : 'Registrar recepción'}
        </Button>
      </DialogActions>

      <DiscardChangesDialog
        open={confirmingClose}
        detail="Se pierden los pesos y las caravanas que destildaste."
        onKeep={() => setConfirmingClose(false)}
        onDiscard={() => {
          setConfirmingClose(false);
          onClose();
        }}
      />
    </Dialog>
  );
};

export default ReceiveDteDialog;

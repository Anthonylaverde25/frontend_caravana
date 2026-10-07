import React, { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrder, EntryOrderDte } from '@/features/entry-orders/types';
import DiscardChangesDialog from '../DiscardChangesDialog';
import ReceivedHeadsField, { HeadsComparison } from './ReceivedHeadsField';
import ReceptionCaravansPanel from './ReceptionCaravansPanel';
import { useDteReception } from './useDteReception';

interface ReceiveDteDialogProps {
  order: EntryOrder;
  /** The DTE being received, or null when closed. */
  dte: EntryOrderDte | null;
  onClose: () => void;
}

const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } } as const;

/**
 * "Recibir" on one DTE. The DTE declares head, not caravans, so receiving it by hand is confirming
 * how many head arrived ("Cabezas recibidas"): that closes the DTE, and a count other than the head
 * in transit raises an incident instead of blocking. Caravans are usually unknown at that point:
 * they are optional, behind "Cargar caravanas ahora", written, pasted or read from the SENASA TRI.
 * The head left without one are written later. "Recibir y registrar caravanas" does the same on a
 * full screen, with the caravans at the center.
 *
 * "Cargar caravanas" opens the same dialog on a DTE already received by count: only the caravans of
 * the head received without one, which they identify.
 */
export const ReceiveDteDialog: React.FC<ReceiveDteDialogProps> = ({ order, dte, onClose }) => {
  const reception = useDteReception(order, dte, onClose);
  const { rows, identifying, expected, received, caravans } = reception;
  const [confirmingClose, setConfirmingClose] = useState(false);

  const requestClose = () => {
    if (reception.isPending) return;
    if (reception.isDirty) setConfirmingClose(true);
    else onClose();
  };

  return (
    <Dialog open={dte != null} onClose={requestClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box sx={{ py: 1.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {identifying ? 'Cargar caravanas · DTE' : 'Recibir DTE'} {dte?.dte_number}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.code} · {dte?.head_count} declaradas · {dte?.received_count} recibidas ·{' '}
            {identifying ? `${expected} sin caravana` : `${expected} en tránsito`}
          </Typography>
        </Box>
        <IconButton onClick={requestClose} size="small" disabled={reception.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              label="Fecha de recepción"
              type="date"
              required
              size="small"
              variant="filled"
              value={reception.receivedAt}
              onChange={(e) => reception.setReceivedAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{ disableUnderline: true }}
              inputProps={{ max: reception.maxDate, min: reception.minDate }}
              sx={{ ...filledSx, width: 200 }}
            />
            {!identifying && <ReceivedHeadsField expected={expected} value={reception.heads} onChange={reception.setHeads} error={reception.headsError} />}
          </Stack>
          {!identifying && received != null && <HeadsComparison expected={expected} received={received} note={reception.note} onNote={reception.setNote} />}
          {reception.headerError && (
            <Alert severity="error" sx={{ py: 0, borderRadius: '6px' }}>
              {reception.headerError}
            </Alert>
          )}
          <ReceptionCaravansPanel
            order={order}
            rows={rows}
            identifying={identifying}
            enabled={reception.withCaravans}
            onEnabled={reception.setWithCaravans}
            expected={reception.caravansExpected}
            expectedLabel={reception.caravansExpectedLabel}
            onTriNumber={reception.setTriNumber}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ py: 1.5, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        {!identifying && received != null && (
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
            {received} recibidas · {caravans} con caravana · {Math.max(0, received - caravans)} sin caravana
          </Typography>
        )}
        <Button onClick={requestClose} disabled={reception.isPending} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={reception.isPending}
          onClick={reception.submit}
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
        >
          {reception.isPending ? 'Registrando…' : identifying ? 'Cargar caravanas' : 'Registrar recepción'}
        </Button>
      </DialogActions>

      <DiscardChangesDialog
        open={confirmingClose}
        detail="Se pierden las cabezas y las caravanas cargadas."
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

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useLoadEntryOrderDte } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import DiscardChangesDialog from '../DiscardChangesDialog';
import { breedsOf, originOf, troopOf } from '../entryOrderFormat';
import DteEntryForm from './DteEntryForm';
import { useDteDraft } from './useDteDraft';

interface LoadDteDialogProps {
  orderId: number | null;
  onClose: () => void;
}

/**
 * "Cargar DTE": the document of an order waiting for it, usually downloaded before the animals
 * travel. The troop was declared when the purchase was confirmed, so it is only recalled in one
 * line; the DTE asks its number, date and how many head it declares. Those head are in transit
 * from now on; their caravans are written down when they arrive. What is missing is marked when
 * "Cargar DTE" is pressed, never by a silently disabled button.
 */
export const LoadDteDialog: React.FC<LoadDteDialogProps> = ({ orderId, onClose }) => {
  const { data: order, isLoading } = useEntryOrder(orderId);
  const load = useLoadEntryOrderDte();
  const draft = useDteDraft();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const isDirty = draft.isDirty;

  /** Escape, a click outside, the X and "Cancelar" all ask first when something was typed. */
  const requestClose = () => {
    if (load.isPending) return;
    if (isDirty) setConfirmingClose(true);
    else onClose();
  };

  useEffect(() => {
    if (orderId != null) draft.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // The head still waiting for a DTE are the likely answer: offered once the order is read.
  useEffect(() => {
    if (order && draft.headCount === '' && order.pending_dte_count > 0) draft.setHeadCount(String(order.pending_dte_count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  const submit = () => {
    if (!order || !draft.validate()) return;

    load.mutate(
      { id: order.id, payload: draft.payload() },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          const body = entryOrderApiError(error);

          const fieldErrors = Object.entries(body?.errors ?? {}).map(([field, messages]) => ({ field, code: 'INVALID', message: messages[0] }));
          draft.setHeaderErrors([...(body?.header_errors ?? []), ...fieldErrors]);
          toast.error(entryOrderErrorMessage(error, 'No se pudo cargar el DTE'));
        }
      }
    );
  };

  return (
    <Dialog
      open={orderId != null}
      onClose={requestClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Cargar DTE
          </Typography>
          {order && (
            <Typography variant="caption" color="text.secondary">
              {order.code} · Lote {order.batch_name} · {order.with_dte_count} de {order.head_count} cabezas con DTE
            </Typography>
          )}
        </Box>
        <IconButton onClick={requestClose} size="small" disabled={load.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
        {isLoading || !order ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Alert severity="info" icon={<FuseSvgIcon size={18}>heroicons-outline:truck</FuseSvgIcon>} sx={{ borderRadius: '6px', py: 0.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {troopOf(order)} · {breedsOf(order)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {originOf(order)}
                {order.dte_count > 0 ? ` · Ya cargados: ${order.dtes.map((d) => d.dte_number).join(', ')}` : ''}. Sus cabezas quedan en tránsito;
                las caravanas se anotan cuando llegan.
              </Typography>
            </Alert>
            <DteEntryForm draft={draft} pending={order.pending_dte_count} />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={requestClose} disabled={load.isPending} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!order || load.isPending}
          onClick={submit}
          startIcon={load.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
        >
          {load.isPending ? 'Cargando…' : 'Cargar DTE'}
        </Button>
      </DialogActions>

      <DiscardChangesDialog
        open={confirmingClose}
        detail="Se pierden los datos del DTE."
        onKeep={() => setConfirmingClose(false)}
        onDiscard={() => {
          setConfirmingClose(false);
          onClose();
        }}
      />
    </Dialog>
  );
};

export default LoadDteDialog;

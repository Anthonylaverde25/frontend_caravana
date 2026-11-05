import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useAttachDteDocument, useLoadEntryOrderDte } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage, type EntryOrderDte } from '@/features/entry-orders/types';
import DiscardChangesDialog from '../DiscardChangesDialog';
import { breedsOf, destinationOf, originOf, troopOf } from '../entryOrderFormat';
import DteEntryForm from './DteEntryForm';
import { useDteDraft } from './useDteDraft';

interface LoadDteDialogProps {
  orderId: number | null;
  /** Head that moved without the paper: the DTE is written on them instead of adding new ones. */
  withoutDocument?: EntryOrderDte | null;
  onClose: () => void;
}

/**
 * "Cargar DTE": the document of an order waiting for it, usually downloaded before the animals
 * travel. The troop was declared when the purchase was confirmed, so it is only recalled in one
 * line; the DTE asks its number, date and how many head it declares. Those head are in transit
 * from now on; their caravans are written down when they arrive. What is missing is marked when
 * "Cargar DTE" is pressed, never by a silently disabled button.
 *
 * The DTE is recommended, not required: "Continuar sin DTE" only asks the head that move, and the
 * order goes on marked "Sin DTE". With `withoutDocument` the dialog loads the paper of those head.
 */
export const LoadDteDialog: React.FC<LoadDteDialogProps> = ({ orderId, withoutDocument = null, onClose }) => {
  const { data: order, isLoading } = useEntryOrder(orderId);
  const loadDte = useLoadEntryOrderDte();
  const attach = useAttachDteDocument();
  const isPending = loadDte.isPending || attach.isPending;
  const draft = useDteDraft();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const isDirty = draft.isDirty;

  /** Escape, a click outside, the X and "Cancelar" all ask first when something was typed. */
  const requestClose = () => {
    if (isPending) return;
    if (isDirty) setConfirmingClose(true);
    else onClose();
  };

  useEffect(() => {
    if (orderId != null) draft.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // The likely answer, offered once the order is read: those head, or the ones nothing declares yet.
  const offered = withoutDocument ? withoutDocument.head_count : (order?.undeclared_head_count ?? 0);
  // Against the purchase: what nothing else declares, these head included.
  const expected = (order?.undeclared_head_count ?? 0) + (withoutDocument?.head_count ?? 0);

  useEffect(() => {
    if (order && orderId != null && draft.headCount === '' && offered > 0) draft.setHeadCount(String(offered));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, orderId, withoutDocument?.id]);

  const handlers = {
    onSuccess: () => onClose(),
    onError: (error: unknown) => {
      const body = entryOrderApiError(error);

      const fieldErrors = Object.entries(body?.errors ?? {}).map(([field, messages]) => ({ field, code: 'INVALID', message: messages[0] }));
      draft.setHeaderErrors([...(body?.header_errors ?? []), ...fieldErrors]);
      toast.error(entryOrderErrorMessage(error, 'No se pudo cargar el DTE'));
    }
  };

  const submit = () => {
    if (!order || !draft.validate()) return;

    if (withoutDocument) attach.mutate({ id: order.id, dteId: withoutDocument.id, payload: draft.payload() }, handlers);
    else loadDte.mutate({ id: order.id, payload: draft.payload() }, handlers);
  };

  const continueWithoutDte = () => {
    if (!order || !draft.validate(0, true)) return;

    loadDte.mutate({ id: order.id, payload: draft.payload(true) }, handlers);
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
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {order.code} · {destinationOf(order)} · {order.with_dte_count} de {order.head_count} cabezas con DTE
            </Typography>
          )}
        </Box>
        <IconButton onClick={requestClose} size="small" disabled={isPending} sx={{ color: 'primary.main' }}>
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
                {order.dte_count > 0 ? ` · Ya cargados: ${order.dtes.flatMap((d) => (d.dte_number ? [d.dte_number] : [])).join(', ')}` : ''}.{' '}
                {withoutDocument
                  ? `Se carga sobre las ${withoutDocument.head_count} cabezas que siguen sin DTE; si declara otra cantidad, queda una novedad.`
                  : 'Sus cabezas quedan en tránsito; las caravanas se anotan cuando llegan.'}
              </Typography>
            </Alert>
            {!withoutDocument && (
              <Typography variant="body2" color="text.secondary">
                Es recomendable cargar el DTE: es el documento oficial del movimiento. Si todavía no lo tenés, podés continuar sin él: indicá las
                cabezas que vienen y la orden queda marcada «Sin DTE» para cargarlo después.
              </Typography>
            )}
            <DteEntryForm draft={draft} pending={expected} />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={requestClose} disabled={isPending} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none', mr: 'auto' }}>
          Cancelar
        </Button>
        {!withoutDocument && (
          <Button
            variant="outlined"
            disabled={!order || isPending}
            onClick={continueWithoutDte}
            sx={{ fontWeight: 600, borderRadius: '6px', textTransform: 'none' }}
          >
            Continuar sin DTE
          </Button>
        )}
        <Button
          variant="contained"
          disableElevation
          disabled={!order || isPending}
          onClick={submit}
          startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
        >
          {isPending ? 'Cargando…' : 'Cargar DTE'}
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

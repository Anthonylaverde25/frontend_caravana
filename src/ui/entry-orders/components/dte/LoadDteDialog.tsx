import React, { useEffect } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useLoadEntryOrderDte } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import EntryTroopSummaryCard from '../EntryTroopSummaryCard';
import { troopItemsOf } from '../troopItems';
import DteEntryForm from './DteEntryForm';
import { troopContextOf } from './troopContext';
import { useDteDraft } from './useDteDraft';

interface LoadDteDialogProps {
  orderId: number | null;
  onClose: () => void;
}

/**
 * "Cargar DTE": the document of an order waiting for it arrived. The troop is shown read-only —
 * it was declared when the purchase was confirmed — and only the DTE and its caravans are asked.
 * Every rejected cell comes back marked; nothing is written until all of them are fixed.
 */
export const LoadDteDialog: React.FC<LoadDteDialogProps> = ({ orderId, onClose }) => {
  const { data: order, isLoading } = useEntryOrder(orderId);
  const load = useLoadEntryOrderDte();
  const draft = useDteDraft();

  useEffect(() => {
    if (orderId != null) draft.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const submit = () => {
    if (!order) return;

    draft.setHeaderErrors([]);
    draft.setRowErrors([]);
    load.mutate(
      { id: order.id, payload: draft.payload() },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          const body = entryOrderApiError(error);

          draft.setHeaderErrors(body?.header_errors ?? []);
          draft.setRowErrors(body?.row_errors ?? []);
          toast.error(entryOrderErrorMessage(error, 'No se pudo cargar el DTE'));
        }
      }
    );
  };

  return (
    <Dialog open={orderId != null} onClose={load.isPending ? undefined : onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}>
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Cargar DTE {order ? `· ${order.code}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Las caravanas del documento entran al lote {order?.batch_name ?? ''} con lo que la orden ya declaró.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={load.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {isLoading || !order ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={3}>
            <EntryTroopSummaryCard
              title={`${order.batch_name} · ${order.entered_count} de ${order.head_count} cabezas ingresadas`}
              subtitle={order.dte_count > 0 ? `DTE ya cargados: ${order.dtes.map((d) => d.dte_number).join(', ')}` : 'Todavía no se cargó ningún DTE.'}
              items={troopItemsOf(order)}
            />
            <DteEntryForm draft={draft} troop={troopContextOf(order)} />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={onClose} disabled={load.isPending} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!order || load.isPending || draft.rows.length === 0 || draft.dteNumber.trim() === ''}
          onClick={submit}
          sx={{ px: 3, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
        >
          {load.isPending ? 'Cargando…' : `Cargar DTE (${draft.rows.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadDteDialog;

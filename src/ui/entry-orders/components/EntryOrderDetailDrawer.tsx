import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useCancelEntryOrder, useCloseIncompleteEntryOrder, useConfirmEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import CreateExternalBatchDialog from '@/ui/batches/components/external/CreateExternalBatchDialog';
import EntryOrderStatusChip from './EntryOrderStatusChip';
import EntryTroopSummaryCard from './EntryTroopSummaryCard';
import EntryOrderDteList from './detail/EntryOrderDteList';
import EntryOrderHistoryTimeline from './detail/EntryOrderHistoryTimeline';
import LoadDteDialog from './dte/LoadDteDialog';
import { troopItemsOf } from './troopItems';
import { sheetUrl } from './entryOrderFormat';

interface EntryOrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * One entry order in full — the troop, its DTEs and the history — and what can still be done with
 * it: a draft is edited and confirmed, an order waiting for its DTE gets it loaded, cancelling is
 * offered while no caravan entered, closing incomplete once some did.
 */
export const EntryOrderDetailDrawer: React.FC<EntryOrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  const { data: order, isLoading } = useEntryOrder(orderId);
  const confirm = useConfirmEntryOrder();
  const cancel = useCancelEntryOrder();
  const closeIncomplete = useCloseIncompleteEntryOrder();
  const [closing, setClosing] = useState<ClosingAction>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dteOrderId, setDteOrderId] = useState<number | null>(null);

  const confirmClosing = (reason: string | null) => {
    if (!order) return;

    if (closing === 'cancel') cancel.mutate({ id: order.id, reason }, { onSuccess: () => setClosing(null) });
    else closeIncomplete.mutate({ id: order.id, reason: reason ?? '' }, { onSuccess: () => setClosing(null) });
  };

  return (
    <Drawer
      anchor="right"
      open={orderId != null}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 760 }, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FuseSvgIcon size={22}>heroicons-outline:truck</FuseSvgIcon>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{order?.code ?? 'Orden de ingreso'}</Typography>
            {order && <EntryOrderStatusChip status={order.status} />}
          </Stack>
          {order && (
            <Typography variant="caption" color="text.secondary">
              N° {order.number} · {order.entered_count} de {order.head_count} cabezas ingresadas · {order.kind_label}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      {isLoading || !order ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
            <Stack spacing={2.5}>
              {order.status === 'AWAITING_DTE' && (
                <Alert severity="info" sx={{ borderRadius: '6px' }}>
                  La compra está confirmada y el lote {order.batch_name} existe, vacío. Las caravanas se asignan cuando llegue el DTE.
                </Alert>
              )}
              {order.closing_reason && (
                <Alert severity={order.status === 'CANCELLED' ? 'warning' : 'info'} sx={{ borderRadius: '6px' }}>
                  {order.closing_reason}
                </Alert>
              )}
              <EntryTroopSummaryCard title="Tropa comprada" subtitle={order.observations ?? undefined} items={troopItemsOf(order)} />
              <Divider />
              <EntryOrderDteList order={order} />
              <Divider />
              <EntryOrderHistoryTimeline history={order.history} />
            </Stack>
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {order.is_editable && (
              <>
                <Button variant="outlined" color="inherit" onClick={() => setIsEditing(true)} sx={actionSx}
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}>
                  Editar borrador
                </Button>
                <Button variant="contained" disableElevation disabled={confirm.isPending} onClick={() => confirm.mutate(order.id)} sx={actionSx}>
                  Confirmar compra
                </Button>
              </>
            )}
            {!order.is_editable && order.status !== 'CANCELLED' && (
              <Button variant="outlined" color="inherit" onClick={() => navigate(sheetUrl(order.id))} sx={actionSx}
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}>
                {order.printed_at ? 'Reimprimir ING-02' : 'Imprimir ING-02'}
              </Button>
            )}
            {order.accepts_dte && (
              <Button variant="contained" disableElevation onClick={() => setDteOrderId(order.id)} sx={actionSx}
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-arrow-down</FuseSvgIcon>}>
                Cargar DTE
              </Button>
            )}
            {order.batch && order.entered_count > 0 && (
              <Button variant="text" onClick={() => navigate('/batches/external-assignment')} sx={actionSx}>
                Asignar a lote propio
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {(order.status === 'DRAFT' || order.status === 'AWAITING_DTE') && (
              <Button variant="outlined" color="error" onClick={() => setClosing('cancel')} sx={actionSx}>
                {order.status === 'DRAFT' ? 'Descartar borrador…' : 'Anular…'}
              </Button>
            )}
            {order.status === 'PARTIAL' && (
              <Button variant="outlined" color="warning" onClick={() => setClosing('close')} sx={actionSx}>
                Cerrar incompleta…
              </Button>
            )}
          </Box>

          <TransferOrderReasonDialog
            open={closing !== null}
            onClose={() => setClosing(null)}
            onConfirm={confirmClosing}
            isPending={cancel.isPending || closeIncomplete.isPending}
            code={order.code}
            reasonRequired={!(closing === 'cancel' && order.is_editable)}
            title={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
            explanation={
              closing === 'cancel' && order.is_editable
                ? 'El borrador no creó ningún lote. Queda descartado en el historial.'
                : closing === 'cancel'
                  ? `No ingresó ninguna caravana. La orden queda anulada con su motivo y el lote ${order.batch_name}, que nunca tuvo animales, se desactiva.`
                  : `Ingresaron ${order.entered_count} de ${order.head_count}. No se esperan más DTE: la orden queda cerrada con las ${order.pending_count} cabezas faltantes y su motivo.`
            }
            confirmLabel={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
          />
          <CreateExternalBatchDialog open={isEditing} mode="order" draft={order} onClose={() => setIsEditing(false)} />
          <LoadDteDialog orderId={dteOrderId} onClose={() => setDteOrderId(null)} />
        </>
      )}
    </Drawer>
  );
};

export default EntryOrderDetailDrawer;

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferOrder } from '@/features/transfer-orders/hooks/useTransferOrder';
import {
  useCancelTransferOrder,
  useCloseIncompleteTransferOrder
} from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import TransferOrderStatusChip from './TransferOrderStatusChip';
import TransferOrderReasonDialog from './TransferOrderReasonDialog';
import TransferOrderDetailSummary from './detail/TransferOrderDetailSummary';
import TransferOrderRollTable from './detail/TransferOrderRollTable';
import TransferOrderHistoryTimeline from './detail/TransferOrderHistoryTimeline';

interface TransferOrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * One order in full: figures, destinations, roll and history, and what can still be done
 * with it. Which actions appear follows the state machine — cancelling is only offered while
 * nothing moved, closing incomplete only once something did.
 */
export const TransferOrderDetailDrawer: React.FC<TransferOrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  const { data: order, isLoading } = useTransferOrder(orderId);
  const cancel = useCancelTransferOrder();
  const closeIncomplete = useCloseIncompleteTransferOrder();
  const [closing, setClosing] = useState<ClosingAction>(null);

  const confirmClosing = (reason: string | null) => {
    if (!order) return;

    if (closing === 'cancel') {
      cancel.mutate({ id: order.id, reason }, { onSuccess: () => setClosing(null) });
      return;
    }

    closeIncomplete.mutate({ id: order.id, reason: reason ?? '' }, { onSuccess: () => setClosing(null) });
  };

  return (
    <Drawer
      anchor="right"
      open={orderId != null}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 720 }, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FuseSvgIcon size={22}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {order?.code ?? 'Orden de transferencia'}
            </Typography>
            {order && <TransferOrderStatusChip status={order.status} />}
          </Stack>
          {order && (
            <Typography variant="caption" color="text.secondary">
              {order.source_activity_name} → {order.destination_activity.name} · lote {order.source_batch.name}
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
              <TransferOrderDetailSummary order={order} />
              <Divider />
              <TransferOrderRollTable order={order} />
              <Divider />
              <TransferOrderHistoryTimeline history={order.history} />
            </Stack>
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {order.is_editable && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>}
                  onClick={() => navigate(`/work-templates/CACT-01?transferOrderId=${order.id}`)}
                  sx={actionSx}
                >
                  Previsualizar planilla
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
                  onClick={() => navigate(`/activities/batches/${order.source_batch.id}/transfer?orderId=${order.id}`)}
                  sx={actionSx}
                >
                  Seguir armando
                </Button>
              </>
            )}
            {order.is_open && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
                  onClick={() => navigate(`/work-templates/CACT-01?transferOrderId=${order.id}`)}
                  sx={actionSx}
                >
                  {order.printed_at ? 'Reimprimir planilla' : 'Imprimir planilla'}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
                  onClick={() => navigate(`/activities/batches/${order.source_batch.id}/transfer?orderId=${order.id}`)}
                  sx={actionSx}
                >
                  Abrir en la transferencia
                </Button>
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {(order.status === 'ISSUED' || order.status === 'DRAFT') && (
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
                ? 'El borrador no comprometía animales ni salió en papel. Queda descartado en el historial.'
                : closing === 'cancel'
                ? 'Nada se movió con esta orden. Queda anulada con su motivo y los animales dejan de estar comprometidos.'
                : `Se movieron ${order.moved_head_count} de ${order.planned_head_count}. La orden se da por terminada y los ${order.pending_head_count} pendientes quedan registrados como que no viajaron.`
            }
            confirmLabel={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
          />
        </>
      )}
    </Drawer>
  );
};

export default TransferOrderDetailDrawer;

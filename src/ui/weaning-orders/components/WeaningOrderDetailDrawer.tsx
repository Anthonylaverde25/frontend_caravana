import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrder';
import { useCancelWeaningOrder, useCloseIncompleteWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrderMutations';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import TransferOrderHistoryTimeline from '@/ui/transfer-orders/components/detail/TransferOrderHistoryTimeline';
import WeaningOrderDetailSummary from './detail/WeaningOrderDetailSummary';
import WeaningOrderRollTable from './detail/WeaningOrderRollTable';
import WeaningOrderIssueDialog from './WeaningOrderIssueDialog';
import ExecuteWeaningOrderDialog from './execute/ExecuteWeaningOrderDialog';
import { sheetUrl } from './weaningOrderFormat';

interface WeaningOrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * One weaning order in full — figures, batches, calves and history — and what can still be done
 * with it, following the state machine: a draft is edited and issued, an open order is printed and
 * executed, cancelling is only offered while nothing was weaned, closing incomplete once something was.
 */
export const WeaningOrderDetailDrawer: React.FC<WeaningOrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  const { data: order, isLoading } = useWeaningOrder(orderId);
  const cancel = useCancelWeaningOrder();
  const closeIncomplete = useCloseIncompleteWeaningOrder();
  const [closing, setClosing] = useState<ClosingAction>(null);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);

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
      PaperProps={{ sx: { width: { xs: '100%', md: 760 }, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FuseSvgIcon size={22}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {order?.code ?? 'Orden de destete'}
            </Typography>
            {order && <TransferOrderStatusChip status={order.status} />}
          </Stack>
          {order && (
            <Typography variant="caption" color="text.secondary">
              Destete {order.weaning_type_label?.toLowerCase() ?? 'sin tipo declarado'} · {order.planned_head_count} cría(s) ·{' '}
              {order.kind_label}
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
              <WeaningOrderDetailSummary order={order} />
              <Divider />
              <WeaningOrderRollTable order={order} />
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
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
                  onClick={() => navigate(`/weaning-orders/new/confirm?orderId=${order.id}`)}
                  sx={actionSx}
                >
                  Seguir armando
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>}
                  onClick={() => navigate(sheetUrl(order.id))}
                  sx={actionSx}
                >
                  Previsualizar planilla
                </Button>
                <Button variant="contained" disableElevation onClick={() => setIsIssueOpen(true)} sx={actionSx}>
                  Emitir
                </Button>
              </>
            )}
            {order.is_open && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
                  onClick={() => navigate(sheetUrl(order.id))}
                  sx={actionSx}
                >
                  {order.printed_at ? 'Reimprimir planilla' : 'Imprimir planilla'}
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:check-circle</FuseSvgIcon>}
                  onClick={() => setIsExecuteOpen(true)}
                  sx={actionSx}
                >
                  Ejecutar orden
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
                ? 'El borrador no comprometía crías ni salió en papel. Queda descartado en el historial.'
                : closing === 'cancel'
                  ? 'No se destetó ninguna cría con esta orden. Queda anulada con su motivo y las crías dejan de estar comprometidas.'
                  : `Se destetaron ${order.weaned_head_count} de ${order.planned_head_count}. La orden se da por terminada y las ${order.pending_head_count} pendientes quedan registradas como no destetadas con ella.`
            }
            confirmLabel={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
          />
          <WeaningOrderIssueDialog order={isIssueOpen ? order : null} onClose={() => setIsIssueOpen(false)} />
          <ExecuteWeaningOrderDialog order={isExecuteOpen ? order : null} onClose={() => setIsExecuteOpen(false)} />
        </>
      )}
    </Drawer>
  );
};

export default WeaningOrderDetailDrawer;

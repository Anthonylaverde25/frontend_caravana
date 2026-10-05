import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBirthOrder } from '@/features/birth-orders/hooks/useBirthOrder';
import { useCancelBirthOrder, useCloseIncompleteBirthOrder } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import TransferOrderHistoryTimeline from '@/ui/transfer-orders/components/detail/TransferOrderHistoryTimeline';
import BirthOrderDetailSummary from './detail/BirthOrderDetailSummary';
import BirthOrderRollTable from './detail/BirthOrderRollTable';
import BirthOrderIssueDialog from './BirthOrderIssueDialog';
import ExecuteBirthOrderDialog from './execute/ExecuteBirthOrderDialog';
import { sheetUrl } from './birthOrderFormat';

interface BirthOrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * One birth order in full — figures, females and history — and what can still be done with it,
 * following the state machine: a draft is edited and issued, an open order is printed (the pending
 * females, before each round) and executed, cancelling is only offered while nothing was registered,
 * closing incomplete once something was.
 */
export const BirthOrderDetailDrawer: React.FC<BirthOrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  const { data: order, isLoading } = useBirthOrder(orderId);
  const cancel = useCancelBirthOrder();
  const closeIncomplete = useCloseIncompleteBirthOrder();
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
        <FuseSvgIcon size={22}>heroicons-outline:sparkles</FuseSvgIcon>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{order?.code ?? 'Orden de parición'}</Typography>
            {order && <TransferOrderStatusChip status={order.status} />}
          </Stack>
          {order && (
            <Typography variant="caption" color="text.secondary">
              {order.head_count} vientre(s) · {order.resolved_head_count} resuelto(s) · {order.kind_label}
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
              <BirthOrderDetailSummary order={order} />
              <Divider />
              <BirthOrderRollTable order={order} />
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
                  onClick={() => navigate(`/birth-orders/new/confirm?orderId=${order.id}`)}
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
                  {order.printed_at ? 'Reimprimir pendientes' : 'Imprimir planilla'}
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:check-circle</FuseSvgIcon>}
                  onClick={() => setIsExecuteOpen(true)}
                  sx={actionSx}
                >
                  Registrar recorrida
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
                Cerrar temporada…
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
                ? 'El borrador no tomaba vientres ni salió en papel. Queda descartado en el historial.'
                : closing === 'cancel'
                  ? 'No se registró ningún parto con esta orden. Queda anulada con su motivo y los vientres quedan libres para otra orden.'
                  : `Se resolvieron ${order.resolved_head_count} de ${order.head_count}. La orden se da por terminada; las ${order.pending_head_count} pendientes siguen preñadas: cerrar la orden no es declarar una pérdida.` +
                    (order.overdue_head_count > 0
                      ? ` Hay ${order.overdue_head_count} hembra(s) con parto vencido: la alerta seguirá en Monitoreo Gestacional.`
                      : '')
            }
            confirmLabel={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
          />
          <BirthOrderIssueDialog order={isIssueOpen ? order : null} onClose={() => setIsIssueOpen(false)} />
          <ExecuteBirthOrderDialog order={isExecuteOpen ? order : null} onClose={() => setIsExecuteOpen(false)} />
        </>
      )}
    </Drawer>
  );
};

export default BirthOrderDetailDrawer;

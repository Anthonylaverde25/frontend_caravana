import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useCancelEntryOrder, useCloseIncompleteEntryOrder, useConfirmEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import CreateExternalBatchDialog from '@/ui/batches/components/external/CreateExternalBatchDialog';
import type { EntryOrderDte, EntryOrderIncident, EntryOrderSummary } from '@/features/entry-orders/types';
import EntryOrderStatusChip from './EntryOrderStatusChip';
import EntryTroopSummaryCard from './EntryTroopSummaryCard';
import EntryOrderDteList from './detail/EntryOrderDteList';
import EntryOrderHistoryTimeline from './detail/EntryOrderHistoryTimeline';
import EntryOrderIncidentList from './detail/EntryOrderIncidentList';
import EntryOrderReceiptSheetList from './detail/EntryOrderReceiptSheetList';
import CorrectDteHeadCountDialog from './dte/CorrectDteHeadCountDialog';
import LoadDteDialog from './dte/LoadDteDialog';
import ReceiveDteDialog from './reception/ReceiveDteDialog';
import ReceiveWithCaravansDialog from './reception/ReceiveWithCaravansDialog';
import ResolveIncidentDialog from './reception/ResolveIncidentDialog';
import { troopItemsOf } from './troopItems';
import { useReceiptSheetPrint } from './useReceiptSheetPrint';
import { headsOf, isTroopComplete, sheetUrl, tracksReception } from './entryOrderFormat';

interface EntryOrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * One entry order in full — the troop, its DTEs with their receptions, the incidents and the
 * history — and what can still be done with it: a draft is edited and confirmed, an order waiting
 * for documents gets a DTE loaded, a DTE with head in transit is received or its head corrected,
 * an incident is resolved. Cancelling is offered while no DTE was loaded; closing incomplete once
 * one was.
 */
const countsOf = (order: EntryOrderSummary) =>
  !tracksReception(order) ? (order.head_count != null ? `${order.head_count} cabezas` : 'Tropa sin completar') : [
    order.with_dte_count > order.head_count ? `${order.head_count} compradas · ${order.with_dte_count} con DTE` : `${order.with_dte_count} de ${order.head_count} con DTE`,
    order.in_transit_count > 0 ? `${order.in_transit_count} en tránsito` : null,
    `${order.received_count} recibidas`,
    order.missing_count > 0 ? `${order.missing_count} no llegarán` : null
  ]
    .filter(Boolean)
    .join(' · ');

export const EntryOrderDetailDrawer: React.FC<EntryOrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  const { data: order, isLoading } = useEntryOrder(orderId);
  const confirm = useConfirmEntryOrder();
  const cancel = useCancelEntryOrder();
  const closeIncomplete = useCloseIncompleteEntryOrder();
  const receiptSheet = useReceiptSheetPrint();
  const [closing, setClosing] = useState<ClosingAction>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dteOrderId, setDteOrderId] = useState<number | null>(null);
  const [receiving, setReceiving] = useState<EntryOrderDte | null>(null);
  const [receivingWithCaravans, setReceivingWithCaravans] = useState<EntryOrderDte | null>(null);
  const [correcting, setCorrecting] = useState<EntryOrderDte | null>(null);
  const [resolving, setResolving] = useState<EntryOrderIncident | null>(null);

  const printSheet = (dte: EntryOrderDte) => {
    if (order) receiptSheet.open(order, dte);
  };

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
            {order && <EntryOrderStatusChip status={order.status} progress={order} />}
          </Stack>
          {order && (
            <Typography variant="caption" color="text.secondary">
              N° {order.number} · {countsOf(order)} · {order.kind_label}
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
              {order.is_editable && !isTroopComplete(order) && (
                <Alert severity="info" sx={{ borderRadius: '6px' }}>
                  Borrador incompleto: para confirmar la compra faltan datos de la tropa. "Confirmar compra" abre el formulario para completarlos.
                </Alert>
              )}
              {order.status === 'AWAITING_DTE' && order.dte_count === 0 && (
                <Alert severity="info" sx={{ borderRadius: '6px' }}>
                  La compra está confirmada y el lote {order.batch_name} existe, vacío. Cada DTE declara cuántas cabezas vienen; las caravanas se anotan cuando llegan.
                </Alert>
              )}
              {order.in_transit_count > 0 && (
                <Alert severity="warning" sx={{ borderRadius: '6px' }}>
                  Hay {headsOf(order.in_transit_count)} en tránsito: todavía no son stock. Recibilas desde su DTE cuando llegue la hacienda, anotando
                  la caravana de cada animal.
                </Alert>
              )}
              {order.closing_reason && (
                <Alert severity={order.status === 'CANCELLED' ? 'warning' : 'info'} sx={{ borderRadius: '6px' }}>
                  {order.closing_reason}
                </Alert>
              )}
              <EntryTroopSummaryCard title="Tropa comprada" subtitle={order.observations ?? undefined} items={troopItemsOf(order)} />
              <Divider />
              <EntryOrderDteList
                order={order}
                onReceive={setReceiving}
                onReceiveWithCaravans={setReceivingWithCaravans}
                onCorrect={setCorrecting}
                onPrintSheet={printSheet}
              />
              <EntryOrderReceiptSheetList order={order} />
              <EntryOrderIncidentList incidents={order.incidents} onResolve={setResolving} />
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
                <Button variant="contained" disableElevation disabled={confirm.isPending} onClick={() => (isTroopComplete(order) ? confirm.mutate(order.id) : setIsEditing(true))} sx={actionSx}>
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
            {/* Only caravans written down can move: head received by count are not animals yet. */}
            {order.batch && order.received_count - order.uncaravaned_count > 0 && (
              <Button variant="text" onClick={() => navigate(`/batches/external-assignment?batchId=${order.batch?.id}`)} sx={actionSx}>
                Asignar a lote propio
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {order.can_cancel && (
              <Button variant="outlined" color="error" onClick={() => setClosing('cancel')} sx={actionSx}>
                {order.status === 'DRAFT' ? 'Descartar borrador…' : 'Anular…'}
              </Button>
            )}
            {order.can_close_incomplete && (
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
                  ? `No se cargó ningún DTE. La orden queda anulada con su motivo y el lote ${order.batch_name}, que nunca tuvo animales, se desactiva.`
                  : order.in_transit_count > 0
                    ? `${order.in_transit_count === 1 ? 'La cabeza que sigue en tránsito se declara' : `Las ${order.in_transit_count} cabezas que siguen en tránsito se declaran`} como que no llegarán, con este motivo, y se registra una novedad por DTE. No se esperan más DTE ni más hacienda.`
                    : `Hay ${order.with_dte_count} de ${order.head_count} cabezas con DTE. No se esperan más DTE: la orden queda cerrada con las ${order.pending_dte_count} cabezas faltantes y su motivo.`
            }
            confirmLabel={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
          />
          <CreateExternalBatchDialog open={isEditing} mode="order" draft={order} onClose={() => setIsEditing(false)} />
          <LoadDteDialog orderId={dteOrderId} onClose={() => setDteOrderId(null)} />
          <ReceiveDteDialog order={order} dte={receiving} onClose={() => setReceiving(null)} />
          <ReceiveWithCaravansDialog order={order} dte={receivingWithCaravans} onClose={() => setReceivingWithCaravans(null)} />
          <CorrectDteHeadCountDialog orderId={order.id} dte={correcting} onClose={() => setCorrecting(null)} />
          <ResolveIncidentDialog orderId={order.id} incident={resolving} onClose={() => setResolving(null)} />
        </>
      )}
    </Drawer>
  );
};

export default EntryOrderDetailDrawer;

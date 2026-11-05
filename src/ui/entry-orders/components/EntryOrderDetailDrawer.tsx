import React, { useState } from 'react';
import { Alert, Box, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useCancelEntryOrder, useCloseIncompleteEntryOrder, useConfirmEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import CreateExternalBatchDialog from '@/ui/batches/components/external/CreateExternalBatchDialog';
import type { EntryOrderDte, EntryOrderIncident, EntryOrderSummary } from '@/features/entry-orders/types';
import EntryOrderStatusChip, { WithoutDteChip } from './EntryOrderStatusChip';
import EntryTroopSummaryCard from './EntryTroopSummaryCard';
import EntryOrderDetailActions from './detail/EntryOrderDetailActions';
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
import { headsOf, isTroopComplete, tracksReception } from './entryOrderFormat';

interface EntryOrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

/**
 * One entry order in full — the troop, its DTEs with their receptions, the incidents and the
 * history — and what can still be done with it: a draft is edited and confirmed, an order waiting
 * for documents gets a DTE loaded or goes on without it, a DTE with head in transit is received or
 * its head corrected, an incident is resolved. Head that moved without the paper get it later, in any
 * status. Cancelling is offered while no DTE was loaded; closing incomplete once one was.
 */
const countsOf = (order: EntryOrderSummary) =>
  !tracksReception(order) ? (order.head_count != null ? `${order.head_count} cabezas` : 'Tropa sin completar') : [
    order.with_dte_count > order.head_count ? `${order.head_count} compradas · ${order.with_dte_count} con DTE` : `${order.with_dte_count} de ${order.head_count} con DTE`,
    order.without_dte_head_count > 0 ? `${order.without_dte_head_count} sin DTE` : null,
    order.in_transit_count > 0 ? `${order.in_transit_count} en tránsito` : null,
    `${order.received_count} recibidas`,
    order.missing_count > 0 ? `${order.missing_count} no llegarán` : null
  ]
    .filter(Boolean)
    .join(' · ');

export const EntryOrderDetailDrawer: React.FC<EntryOrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const { data: order, isLoading } = useEntryOrder(orderId);
  const confirm = useConfirmEntryOrder();
  const cancel = useCancelEntryOrder();
  const closeIncomplete = useCloseIncompleteEntryOrder();
  const receiptSheet = useReceiptSheetPrint();
  const [closing, setClosing] = useState<ClosingAction>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dteOrderId, setDteOrderId] = useState<number | null>(null);
  const [attaching, setAttaching] = useState<EntryOrderDte | null>(null);
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
            {order?.without_dte && <WithoutDteChip />}
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
              {order.status === 'AWAITING_DTE' && order.dtes.length === 0 && (
                <Alert
                  severity="info"
                  sx={{ borderRadius: '6px' }}
                >
                  {order.batch
                    ? `La compra está confirmada y el lote de tránsito ${order.batch_name} existe, vacío.`
                    : 'La compra está confirmada: sus animales entran directo a sus lotes de destino cuando se reciben.'}{' '}
                  Se recomienda cargar el DTE, que declara cuántas cabezas vienen. Si todavía no lo tenés, podés continuar sin él: la orden queda
                  marcada «Sin DTE» y sigue su curso.
                </Alert>
              )}
              {order.without_dte && (
                <Alert severity="warning" sx={{ borderRadius: '6px' }}>
                  {headsOf(order.without_dte_head_count)} sin DTE. La operación sigue su curso, pero es recomendable cargarlo apenas lo tengas: es el
                  documento oficial del movimiento.
                </Alert>
              )}
              {order.in_transit_count > 0 && (
                <Alert severity="warning" sx={{ borderRadius: '6px' }}>
                  Hay {headsOf(order.in_transit_count)} en tránsito: todavía no son stock. Recibilas abajo cuando llegue la hacienda, anotando la
                  caravana de cada animal.
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
                onAttachDocument={setAttaching}
              />
              <EntryOrderReceiptSheetList order={order} />
              <EntryOrderIncidentList incidents={order.incidents} onResolve={setResolving} />
              <Divider />
              <EntryOrderHistoryTimeline history={order.history} />
            </Stack>
          </Box>

          <EntryOrderDetailActions
            order={order}
            isConfirming={confirm.isPending}
            onEdit={() => setIsEditing(true)}
            onConfirm={() => confirm.mutate(order.id)}
            onLoadDte={() => setDteOrderId(order.id)}
            onCancel={() => setClosing('cancel')}
            onCloseIncomplete={() => setClosing('close')}
          />

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
                  ? order.batch
                    ? `No se cargó ningún DTE. La orden queda anulada con su motivo y el lote ${order.batch_name}, que nunca tuvo animales, se desactiva.`
                    : 'No se cargó ningún DTE. La orden queda anulada con su motivo; los lotes propios de destino no cambian.'
                  : order.in_transit_count > 0
                    ? `${order.in_transit_count === 1 ? 'La cabeza que sigue en tránsito se declara' : `Las ${order.in_transit_count} cabezas que siguen en tránsito se declaran`} como que no llegarán, con este motivo, y se registra una novedad por DTE. No se esperan más DTE ni más hacienda.`
                    : `No se esperan más cabezas: la orden queda cerrada con las ${order.undeclared_head_count} que nunca vinieron y su motivo.`
            }
            confirmLabel={closing !== 'cancel' ? 'Cerrar incompleta' : order.is_editable ? 'Descartar borrador' : 'Anular orden'}
          />
          <CreateExternalBatchDialog open={isEditing} mode="order" draft={order} onClose={() => setIsEditing(false)} />
          <LoadDteDialog orderId={dteOrderId} onClose={() => setDteOrderId(null)} />
          <LoadDteDialog orderId={attaching ? order.id : null} withoutDocument={attaching} onClose={() => setAttaching(null)} />
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

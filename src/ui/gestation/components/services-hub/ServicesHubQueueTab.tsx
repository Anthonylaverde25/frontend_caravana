import { useCallback, useEffect, useMemo, useState } from 'react';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useApproveServiceOrder, type ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrderDetailDrawer from '../service-order-drawer/ServiceOrderDetailDrawer';
import { useServiceOrderClosing } from '../dialogs/close-diagnosis/useServiceOrderClosing';
import { defaultReturnTo, tactoStartPath, type TactoEntryState } from '../tacto-start/tactoStart';
import { isOpenStatus } from '../../utils/serviceOrderStatus';
import { useServicesQueue } from './queue/useServicesQueue';
import ServicesPhaseStrip from './queue/ServicesPhaseStrip';
import ServicesQueueFilters from './queue/ServicesQueueFilters';
import ServicesQueueTable from './queue/ServicesQueueTable';
import ServicesDrawerNextStep from './queue/ServicesDrawerNextStep';
import type { QueueOrderHandlers } from './queue/ServicesNextStepActions';
import ServicesQueueDialogs, { type BullReplacement } from './queue/ServicesQueueDialogs';

interface ServicesHubQueueTabProps {
  orders: ServiceOrder[];
  batches: Batch[];
  caravans: Caravan[];
  onSwitchToHistory: () => void;
  serviceType?: 'conventional' | 'insemination';
}

/** The backend's message when there is one, else the error's own. */
function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || (error instanceof Error ? error.message : String(error));
}

const emptySx = { p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '8px' } as const;

/**
 * Queue of /gestation/services: every order with work left, grouped by phase, each with the
 * one step that moves it forward. Holds the dialogs those steps open (approval, bull withdrawal or
 * swap, closing) and the detail drawer with the same step on top.
 */
export default function ServicesHubQueueTab({ orders, batches, caravans, onSwitchToHistory, serviceType }: ServicesHubQueueTabProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const closing = useServiceOrderClosing();
  const approveMutation = useApproveServiceOrder();

  const [withdrawingOrder, setWithdrawingOrder] = useState<ServiceOrder | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<ServiceOrder | null>(null);
  const [replacing, setReplacing] = useState<BullReplacement | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(Number(searchParams.get('orderId')) || null);

  const batchNames = useMemo(() => new Map(batches.map((b) => [b.id, b.name])), [batches]);
  const batchNameOf = useCallback(
    (order: ServiceOrder) => batchNames.get(order.batch_id) || order.batch_name || `Lote #${order.batch_id}`,
    [batchNames]
  );
  const batchOptions = useMemo(() => batches.map((b) => ({ id: b.id as number, name: b.name as string })), [batches]);

  const queue = useServicesQueue(orders, batchNameOf, Number(searchParams.get('batchId')) || null, serviceType);
  const detailOrder = useMemo(() => orders.find((o) => o.id === detailOrderId) ?? null, [orders, detailOrderId]);

  // Links from elsewhere: ?closeOrder opens the closing, ?orderId the detail.
  useEffect(() => {
    const requested = Number(searchParams.get('closeOrder'));
    if (!requested || orders.length === 0) return;
    const order = orders.find((o) => o.id === requested);
    searchParams.delete('closeOrder');
    setSearchParams(searchParams, { replace: true });
    if (order && isOpenStatus(order.status)) closing.requestClose(order);
  }, [searchParams, setSearchParams, orders]);

  const closeDetail = () => {
    setDetailOrderId(null);
    if (searchParams.has('orderId')) {
      searchParams.delete('orderId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const approve = async (order: ServiceOrder) => {
    try {
      await approveMutation.mutateAsync({ id: order.id, approve: true });
      toast.success(`Orden ${order.code} aprobada: el servicio empieza`);
    } catch (e) {
      toast.error(`Error al aprobar la orden: ${errorMessage(e)}`);
    }
  };

  const reject = async (reason: string) => {
    if (!rejectingOrder) return;
    try {
      await approveMutation.mutateAsync({ id: rejectingOrder.id, approve: false, reason });
      toast.success(`Orden ${rejectingOrder.code} rechazada`);
      setRejectingOrder(null);
    } catch (e) {
      toast.error(`Error al rechazar la orden: ${errorMessage(e)}`);
    }
  };

  const handlers: QueueOrderHandlers = {
    onPrintSheet: (order) => navigate(`/work-templates/REP-01?orderId=${order.id}`),
    onBulkEntry: (orderId) =>
      navigate(tactoStartPath(orderId), { state: { returnTo: defaultReturnTo(orderId) } satisfies TactoEntryState }),
    onCloseOrder: (order) => closing.requestClose(order),
    onWithdrawBulls: setWithdrawingOrder,
    onReplaceBull: (order, bull) => setReplacing({ order, bull }),
    onView: (order) => setDetailOrderId(order.id),
    onApprove: approve,
    onReject: setRejectingOrder,
  };

  return (
    <Box sx={{ width: '100%' }}>
      {queue.totalCount === 0 ? (
        <Paper elevation={0} sx={emptySx}>
          <FuseSvgIcon size={44} className="text-disabled mb-2">
            heroicons-outline:check-badge
          </FuseSvgIcon>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {serviceType === 'conventional'
              ? 'No hay órdenes de servicio convencional en curso.'
              : serviceType === 'insemination'
                ? 'No hay órdenes de inseminación en curso.'
                : 'No hay órdenes de servicio en curso.'}
          </Typography>
          <Link component="button" onClick={onSwitchToHistory} sx={{ mt: 1.5, fontWeight: 600 }}>
            Ver el historial
          </Link>
        </Paper>
      ) : (
        <Stack spacing={2}>
          <ServicesPhaseStrip allTile={queue.allTile} tiles={queue.tiles} selected={queue.filters.stage} onSelect={queue.setStage} />
          <ServicesQueueFilters model={queue} batchOptions={batchOptions} />
          {queue.sections.length === 0 ? (
            <Paper elevation={0} sx={{ ...emptySx, borderStyle: 'dashed' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Ninguna orden coincide con los filtros.
              </Typography>
              <Link component="button" onClick={queue.reset} sx={{ mt: 1, fontWeight: 600 }}>
                Quitar filtros
              </Link>
            </Paper>
          ) : (
            <ServicesQueueTable
              sections={queue.sections}
              caravans={caravans}
              batchNameOf={batchNameOf}
              isApproving={approveMutation.isPending}
              {...handlers}
            />
          )}
        </Stack>
      )}

      <ServiceOrderDetailDrawer
        open={detailOrder !== null}
        onClose={closeDetail}
        order={detailOrder}
        caravans={caravans}
        batches={batches}
        onPrintSheet={handlers.onPrintSheet}
        inTray
        nextStep={
          <ServicesDrawerNextStep
            order={detailOrder}
            batchName={detailOrder ? batchNameOf(detailOrder) : ''}
            caravans={caravans}
            isApproving={approveMutation.isPending}
            {...handlers}
            onView={() => undefined}
          />
        }
      />

      <ServicesQueueDialogs
        batches={batches}
        caravans={caravans}
        withdrawing={withdrawingOrder}
        onWithdrawDone={() => setWithdrawingOrder(null)}
        replacing={replacing}
        onReplaceDone={() => setReplacing(null)}
        closingOrder={closing.closingOrder}
        onClosingDone={closing.dismiss}
        rejecting={rejectingOrder}
        onRejectCancel={() => setRejectingOrder(null)}
        onRejectSubmit={reject}
        isRejecting={approveMutation.isPending}
      />
    </Box>
  );
}

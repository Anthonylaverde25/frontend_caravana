import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { ServiceOrder, useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import DiagnosisTraySection from '../components/diagnosis-tray/DiagnosisTraySection';
import DiagnosisTraySummary from '../components/diagnosis-tray/DiagnosisTraySummary';
import DiagnosisTrayFilters from '../components/diagnosis-tray/DiagnosisTrayFilters';
import { useDiagnosisTrayFilters } from '../components/diagnosis-tray/useDiagnosisTrayFilters';
import { useTrayViewMode } from '../components/diagnosis-tray/useTrayViewMode';
import TrayViewToggle from '../components/diagnosis-tray/TrayViewToggle';
import DiagnosisTrayTable, { type TrayOrderHandlers } from '../components/diagnosis-tray/table/DiagnosisTrayTable';
import CloseServiceOrderDialog from '../components/dialogs/CloseServiceOrderDialog';
import ServiceOrderDetailDrawer from '../components/service-order-drawer/ServiceOrderDetailDrawer';
import CloseServiceOrderDiagnosisDialog from '../components/dialogs/close-diagnosis/CloseServiceOrderDiagnosisDialog';
import { useServiceOrderClosing } from '../components/dialogs/close-diagnosis/useServiceOrderClosing';
import { defaultReturnTo, tactoStartPath, type TactoEntryState } from '../components/tacto-start/tactoStart';
import { trayCardId } from '../utils/diagnosisTray';
import { isOpenStatus } from '../utils/serviceOrderStatus';

/** How long the order the tray was opened on stays outlined. */
const HIGHLIGHT_MS = 4000;

/**
 * Diagnosis tray ("Bandeja de tacto"): the only place where an open service order is worked —
 * diagnosis rounds (screen or REP-01 sheet), bull withdrawal and closing. Orders are grouped by
 * what can be done with them, the ones that can be finished first. The register of every order
 * lives in /gestation/service-orders.
 *
 * Each card opens the order detail (the same drawer as the register).
 *
 * `?orderId=<id>` scrolls to that order and outlines it; `?closeOrder=<id>` opens its closing
 * (e.g. coming back from a scanned sheet).
 */
function GestationTactoView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
  const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
  const closing = useServiceOrderClosing();
  const [withdrawingOrder, setWithdrawingOrder] = useState<ServiceOrder | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<number | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  const batchNames = useMemo(() => new Map(batches.map((b) => [b.id, b.name])), [batches]);
  const batchNameOf = useCallback(
    (order: ServiceOrder) => batchNames.get(order.batch_id) || order.batch_name || `Lote #${order.batch_id}`,
    [batchNames]
  );
  const tray = useDiagnosisTrayFilters(orders, batchNameOf);
  const [viewMode, setViewMode] = useTrayViewMode();
  // Looked up on every render so the drawer follows the order after a mutation.
  const detailOrder = useMemo(() => orders.find((o) => o.id === detailOrderId) ?? null, [orders, detailOrderId]);
  const isLoading = isLoadingCaravans || isLoadingOrders || isLoadingBatches;

  useEffect(() => {
    const requested = Number(searchParams.get('closeOrder'));
    if (!requested || orders.length === 0) return;
    const order = orders.find((o) => o.id === requested);
    // The param goes first: clearing it afterwards would replace the navigation to the closing.
    searchParams.delete('closeOrder');
    setSearchParams(searchParams, { replace: true });
    if (order && isOpenStatus(order.status)) closing.requestClose(order);
  }, [searchParams, setSearchParams, orders]);

  useEffect(() => {
    const requested = Number(searchParams.get('orderId'));
    if (!requested || isLoading) return;
    searchParams.delete('orderId');
    setSearchParams(searchParams, { replace: true });
    // The requested order must be on screen: a filter could be hiding it.
    tray.reset();
    setHighlightedOrderId(requested);
    // After the cards render.
    requestAnimationFrame(() => document.getElementById(trayCardId(requested))?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [searchParams, setSearchParams, isLoading]);

  useEffect(() => {
    if (highlightedOrderId === null) return undefined;
    const timer = window.setTimeout(() => setHighlightedOrderId(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [highlightedOrderId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando órdenes y diagnósticos...
        </Typography>
      </Box>
    );
  }

  const handlers: TrayOrderHandlers = {
    onPrintSheet: (order) => navigate(`/work-templates/REP-01?orderId=${order.id}`),
    onBulkEntry: (orderId) => navigate(tactoStartPath(orderId), { state: { returnTo: defaultReturnTo(orderId) } satisfies TactoEntryState }),
    onCloseOrder: (order) => closing.requestClose(order),
    onWithdrawBulls: setWithdrawingOrder,
    onView: (order) => setDetailOrderId(order.id),
  };
  const withdrawingBatch = withdrawingOrder ? batches.find((b) => b.id === withdrawingOrder.batch_id) ?? null : null;

  return (
    <ViewLayout
      title="Bandeja de tacto"
      subtitle="Órdenes de servicio abiertas: cargá el tacto por ronda (en pantalla o con la planilla REP-01), retirá la torada y cerrá cada orden con su diagnóstico."
      actions={
        <Button
          variant="text"
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:queue-list</FuseSvgIcon>}
          onClick={() => navigate('/gestation/service-orders')}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Ver todas las órdenes
        </Button>
      }
    >
      {tray.totalCount === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
          <FuseSvgIcon size={48} className="text-disabled mb-2">heroicons-outline:document-text</FuseSvgIcon>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            No hay órdenes de servicio abiertas para tactar.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          <Stack spacing={2}>
            <DiagnosisTraySummary counts={tray.phaseCounts} selected={tray.filters.phase} onSelect={tray.setPhase} />
            <DiagnosisTrayFilters model={tray} endSlot={<TrayViewToggle value={viewMode} onChange={setViewMode} />} />
          </Stack>
          {tray.sections.length === 0 && (
            <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: '10px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Ninguna orden coincide con los filtros.
              </Typography>
            </Paper>
          )}
          {tray.sections.length > 0 && viewMode === 'table' && (
            <DiagnosisTrayTable sections={tray.sections} caravans={caravans} batchNameOf={batchNameOf} highlightedOrderId={highlightedOrderId} {...handlers} />
          )}
          {viewMode === 'cards' &&
            tray.sections.map((section) => (
              <DiagnosisTraySection
                key={section.phase}
                section={section}
                caravans={caravans}
                batchNameOf={batchNameOf}
                highlightedOrderId={highlightedOrderId}
                {...handlers}
              />
            ))}
        </Stack>
      )}

      <ServiceOrderDetailDrawer
        open={detailOrder !== null}
        onClose={() => setDetailOrderId(null)}
        order={detailOrder}
        caravans={caravans}
        batches={batches}
        onPrintSheet={(order) => navigate(`/work-templates/REP-01?orderId=${order.id}`)}
        inTray
      />

      {withdrawingOrder && (
        <CloseServiceOrderDialog
          open
          onClose={() => setWithdrawingOrder(null)}
          order={withdrawingOrder}
          batch={withdrawingBatch}
          batches={batches}
          caravans={caravans}
          onSuccess={() => setWithdrawingOrder(null)}
        />
      )}
      {closing.closingOrder && <CloseServiceOrderDiagnosisDialog open order={closing.closingOrder} onClose={closing.dismiss} />}
    </ViewLayout>
  );
}

export default GestationTactoView;

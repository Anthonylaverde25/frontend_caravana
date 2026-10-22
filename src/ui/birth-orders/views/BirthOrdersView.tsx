import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useBirthOrdersWithRoll } from '@/features/birth-orders/hooks/useBirthOrders';
import type { BirthOrderSummary } from '@/features/birth-orders/types';
import type { TransferOrderStatusFilterValue } from '@/ui/transfer-orders/components/TransferOrdersStatusFilter';
import BirthOrdersTable from '../components/BirthOrdersTable';
import BirthOrdersToolbar, { type BirthOrdersViewMode } from '../components/BirthOrdersToolbar';
import BirthOrderGroupCard from '../components/grouped/BirthOrderGroupCard';
import BirthOrderDetailDrawer from '../components/BirthOrderDetailDrawer';
import BirthOrderIssueDialog from '../components/BirthOrderIssueDialog';
import BirthOrderStartDialog from '../components/start/BirthOrderStartDialog';
import RegisterBirthsDialog from '../components/register/RegisterBirthsDialog';
import { emptyBirthHeader, type BirthFormMode, type BirthOrderStart } from '../components/start/birthOrderStart';
import { periodOf, sourcesOf } from '../components/birthOrderFormat';

const matchesStatus = (order: BirthOrderSummary, filter: TransferOrderStatusFilterValue): boolean =>
  filter === 'ALL' ? true : filter === 'OPEN' ? order.is_open : order.status === filter;

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Every birth order of the company, in every state, and the two ways a calving season is loaded:
 * ordered before the rounds ("Nueva orden de parición") or registered after the calvings
 * ("Registrar partos"). The orders read grouped (order → batch → its
 * females, as "Asignar a lote propio") or as the flat table.
 *
 * `?orderId=` opens an order directly, which is how the scan links here. On `/new` and `/register`
 * (`starting`) the list sits under the full-screen dialog: a new order preselects the pregnant
 * females of `?batchId=`; a registration is scoped to that batch, or covers every batch without it.
 */
export const BirthOrdersView: React.FC<{ starting?: BirthFormMode }> = ({ starting }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: orders = [], isLoading, isError } = useBirthOrdersWithRoll();
  const [status, setStatus] = useState<TransferOrderStatusFilterValue>('ALL');
  const [search, setSearch] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [viewMode, setViewMode] = useState<BirthOrdersViewMode>('grouped');
  const [toIssue, setToIssue] = useState<BirthOrderSummary | null>(null);
  const [isStarting, setIsStarting] = useState(starting === 'order');

  useEffect(() => {
    if (starting === 'order') setIsStarting(true);
  }, [starting]);

  const openedId = Number(searchParams.get('orderId')) || null;
  const batchId = Number(searchParams.get('batchId')) || null;

  const initial = useMemo<BirthOrderStart | null>(() => {
    const state = location.state as BirthOrderStart | null;

    if (state?.motherIds) return state;

    return batchId ? { orderId: null, orderCode: null, motherIds: [], header: emptyBirthHeader(), batchId } : null;
  }, [location.state, batchId]);

  const setOpened = (id: number | null) => {
    const next = new URLSearchParams(searchParams);

    if (id == null) next.delete('orderId');
    else next.set('orderId', String(id));

    setSearchParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const result = { ALL: orders.length, OPEN: 0, DRAFT: 0, ISSUED: 0, PARTIAL: 0, EXECUTED: 0, CLOSED_INCOMPLETE: 0, CANCELLED: 0 } as Record<
      TransferOrderStatusFilterValue,
      number
    >;

    orders.forEach((order) => {
      result[order.status] += 1;

      if (order.is_open) result.OPEN += 1;
    });

    return result;
  }, [orders]);

  const visible = useMemo(() => {
    const term = normalize(search.trim());

    return orders.filter(
      (order) =>
        matchesStatus(order, status) &&
        (!overdueOnly || order.overdue_head_count > 0) &&
        (term === '' || [order.code, sourcesOf(order), periodOf(order), order.responsable ?? ''].some((text) => normalize(text).includes(term)))
    );
  }, [orders, status, search, overdueOnly]);

  const withOverdue = useMemo(() => orders.filter((order) => order.overdue_head_count > 0).length, [orders]);

  return (
    <ViewLayout
      title="Órdenes de Parición"
      subtitle="Todas las órdenes PAR-01: las que se emiten antes de las recorridas y los partos registrados después del hecho. La cría nace en el lote de su madre."
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate('/birth-orders/register')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2 }}
          >
            Registrar partos
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={() => navigate('/birth-orders/new')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5 }}
          >
            Nueva orden de parición
          </Button>
        </Stack>
      }
    >
      <BirthOrdersToolbar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        counts={counts}
        overdueOnly={overdueOnly}
        onToggleOverdue={() => setOverdueOnly((value) => !value)}
        withOverdue={withOverdue}
        viewMode={viewMode}
        onToggleView={() => setViewMode((mode) => (mode === 'grouped' ? 'flat' : 'grouped'))}
      />

      <Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ borderRadius: '6px' }}>
            No se pudieron cargar las órdenes de parición.
          </Alert>
        ) : visible.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FuseSvgIcon size={36} color="disabled">
              heroicons-outline:clipboard-document-list
            </FuseSvgIcon>
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
              {orders.length === 0 ? 'Todavía no hay órdenes de parición' : 'Ninguna orden coincide con el filtro'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orders.length === 0
                ? 'Empezá con "Nueva orden de parición" o "Registrar partos", o desde un lote de Monitoreo Gestacional.'
                : 'Probá con otro estado o con otra búsqueda.'}
            </Typography>
          </Box>
        ) : viewMode === 'grouped' ? (
          <Stack spacing={3}>
            {visible.map((order) => (
              <BirthOrderGroupCard key={order.id} order={order} onOpen={(opened) => setOpened(opened.id)} onIssue={setToIssue} />
            ))}
          </Stack>
        ) : (
          <BirthOrdersTable orders={visible} onOpen={(order) => setOpened(order.id)} onIssue={setToIssue} />
        )}
      </Box>

      <BirthOrderDetailDrawer orderId={openedId} onClose={() => setOpened(null)} />
      <BirthOrderIssueDialog order={toIssue} onClose={() => setToIssue(null)} />
      <BirthOrderStartDialog
        open={starting === 'order' && isStarting}
        initial={initial}
        onClose={() => setIsStarting(false)}
        onExited={() => navigate('/birth-orders')}
      />
      {starting === 'register' && (
        <RegisterBirthsDialog
          key={batchId ?? 'all'}
          batchId={batchId}
          onClose={() => navigate('/birth-orders')}
          onDone={(orderId) => navigate(`/birth-orders?orderId=${orderId}`)}
        />
      )}
    </ViewLayout>
  );
};

export default BirthOrdersView;

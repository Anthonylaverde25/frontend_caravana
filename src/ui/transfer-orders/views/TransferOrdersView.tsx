import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useTransferOrders } from '@/features/transfer-orders/hooks/useTransferOrders';
import type { TransferOrderSummary } from '@/features/transfer-orders/types';
import TransferOrdersStatusFilter, {
  TransferOrderStatusFilterValue
} from '../components/TransferOrdersStatusFilter';
import TransferOrdersTable from '../components/TransferOrdersTable';
import TransferOrderDetailDrawer from '../components/TransferOrderDetailDrawer';
import TransferOrderIssueDialog from '../components/TransferOrderIssueDialog';
import CreateTransferOrderDialog from '../components/CreateTransferOrderDialog';

const matchesStatus = (order: TransferOrderSummary, filter: TransferOrderStatusFilterValue): boolean =>
  filter === 'ALL' ? true : filter === 'OPEN' ? order.is_open : order.status === filter;

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Every transfer order of the company, in every state.
 *
 * The whole list is fetched once and filtered here: the counts on the status pills are the
 * first thing worth reading — how many orders are still open, and how many ended incomplete —
 * and they need every order, not only the ones on screen.
 *
 * `?orderId=` opens an order directly, which is how the band on /transfer links here.
 */
export const TransferOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: orders = [], isLoading, isError } = useTransferOrders();
  const [status, setStatus] = useState<TransferOrderStatusFilterValue>('ALL');
  const [search, setSearch] = useState('');
  const [toIssue, setToIssue] = useState<TransferOrderSummary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openedId = Number(searchParams.get('orderId')) || null;

  const setOpened = (id: number | null) => {
    const next = new URLSearchParams(searchParams);

    if (id == null) next.delete('orderId');
    else next.set('orderId', String(id));

    setSearchParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const result = {
      ALL: orders.length,
      OPEN: 0,
      DRAFT: 0,
      ISSUED: 0,
      PARTIAL: 0,
      EXECUTED: 0,
      CLOSED_INCOMPLETE: 0,
      CANCELLED: 0
    } as Record<TransferOrderStatusFilterValue, number>;

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
        (term === '' ||
          [order.code, order.source_batch.name ?? '', order.destination_activity.name ?? '', ...order.destinations.map((d) => d.label)]
            .some((text) => normalize(text).includes(term)))
    );
  }, [orders, status, search]);

  return (
    <ViewLayout
      title="Órdenes de Transferencia"
      subtitle="Todas las órdenes CACT-01, en todos sus estados: borradores, emitidas, parciales, ejecutadas, cerradas incompletas y anuladas."
      actions={
        <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={() => navigate('/transfer-orders/register')}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2 }}
        >
          Registrar transferencia
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => setIsCreateOpen(true)}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5 }}
        >
          Crear orden de transferencia
        </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          <TextField
            size="small"
            placeholder="Buscar por código, lote o destino…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FuseSvgIcon size={18} color="action">
                    heroicons-outline:magnifying-glass
                  </FuseSvgIcon>
                </InputAdornment>
              )
            }}
          />
          <TransferOrdersStatusFilter value={status} onChange={setStatus} counts={counts} />
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ borderRadius: '6px' }}>
            No se pudieron cargar las órdenes de transferencia.
          </Alert>
        ) : visible.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FuseSvgIcon size={36} color="disabled">
              heroicons-outline:clipboard-document-list
            </FuseSvgIcon>
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
              {orders.length === 0 ? 'Todavía no se emitió ninguna orden' : 'Ninguna orden coincide con el filtro'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orders.length === 0
                ? 'Las órdenes se emiten desde la transferencia de un lote, con "Crear orden" o al imprimir la planilla CACT-01.'
                : 'Probá con otro estado o con otra búsqueda.'}
            </Typography>
          </Box>
        ) : (
          <TransferOrdersTable orders={visible} onOpen={(order) => setOpened(order.id)} onIssue={setToIssue} />
        )}
      </Stack>

      <TransferOrderDetailDrawer orderId={openedId} onClose={() => setOpened(null)} />
      <TransferOrderIssueDialog order={toIssue} onClose={() => setToIssue(null)} />
      <CreateTransferOrderDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </ViewLayout>
  );
};

export default TransferOrdersView;

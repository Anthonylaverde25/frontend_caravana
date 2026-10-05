import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert, Box, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useEntryOrders } from '@/features/entry-orders/hooks/useEntryOrders';
import type { EntryOrderSummary } from '@/features/entry-orders/types';
import EntryOrdersStatusFilter, { EntryOrderStatusFilterValue } from '../components/EntryOrdersStatusFilter';
import { isDiscardedDraft } from '../components/EntryOrderStatusChip';
import EntryOrdersTable from '../components/EntryOrdersTable';
import EntryOrderDetailDrawer from '../components/EntryOrderDetailDrawer';
import EntryStartActions from '../components/EntryStartActions';
import LoadDteDialog from '../components/dte/LoadDteDialog';
import { breedsOf, normalize, originOf } from '../components/entryOrderFormat';

const searchableOf = (order: EntryOrderSummary): string[] => [
  order.code,
  order.batch_name ?? '',
  originOf(order),
  order.auction_number ?? '',
  breedsOf(order),
  ...order.dtes.map((d) => d.dte_number)
];

/**
 * Every entry order of external livestock, in every state. "En espera de DTE" is the pile that
 * matters when a document arrives: search it by provider, auction or batch, and load the DTE from
 * the row. `?orderId=` opens an order directly.
 */
export const EntryOrdersView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: orders = [], isLoading, isError } = useEntryOrders();
  const [status, setStatus] = useState<EntryOrderStatusFilterValue>('ALL');
  const [search, setSearch] = useState('');
  const [dteOrderId, setDteOrderId] = useState<number | null>(null);
  const openedId = Number(searchParams.get('orderId')) || null;

  const setOpened = (id: number | null) => {
    const next = new URLSearchParams(searchParams);

    if (id == null) next.delete('orderId');
    else next.set('orderId', String(id));

    setSearchParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const result: Record<EntryOrderStatusFilterValue, number> = {
      ALL: orders.length,
      DRAFT: 0,
      AWAITING_DTE: 0,
      IN_TRANSIT: 0,
      COMPLETED: 0,
      CLOSED_INCOMPLETE: 0,
      CANCELLED: 0,
      WITH_INCIDENTS: 0
    };

    orders.forEach((order) => {
      result[order.status] += 1;
      if (order.open_incidents_count > 0) result.WITH_INCIDENTS += 1;
      if (isDiscardedDraft(order.status, order)) result.ALL -= 1;
    });

    return result;
  }, [orders]);

  const visible = useMemo(() => {
    const term = normalize(search.trim());

    return orders.filter(
      (order) =>
        // Discarded drafts are not purchases: they only show under "Anulada".
        ((status === 'ALL' && !isDiscardedDraft(order.status, order)) ||
          order.status === status ||
          (status === 'WITH_INCIDENTS' && order.open_incidents_count > 0)) &&
        (term === '' || searchableOf(order).some((text) => normalize(text).includes(term)))
    );
  }, [orders, status, search]);

  return (
    <ViewLayout
      title="Órdenes de Ingreso"
      subtitle="Compras de hacienda externa (ING-02): la orden nace sin caravanas, espera su DTE y después la hacienda."
      actions={<EntryStartActions onSaved={(result) => setOpened(result.order.id)} />}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          <TextField
            size="small"
            placeholder="Buscar por código, proveedor, subasta, lote o DTE…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { md: 360 } }}
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
          <EntryOrdersStatusFilter value={status} onChange={setStatus} counts={counts} />
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ borderRadius: '6px' }}>
            No se pudieron cargar las órdenes de ingreso.
          </Alert>
        ) : visible.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FuseSvgIcon size={36} color="disabled">
              heroicons-outline:truck
            </FuseSvgIcon>
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
              {orders.length === 0 ? 'Todavía no hay órdenes de ingreso' : 'Ninguna orden coincide con el filtro'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orders.length === 0 ? 'Empezá con "Nueva orden de ingreso" o "Registrar ingreso".' : 'Probá con otro estado o con otra búsqueda.'}
            </Typography>
          </Box>
        ) : (
          <EntryOrdersTable orders={visible} onOpen={(order) => setOpened(order.id)} onLoadDte={(order) => setDteOrderId(order.id)} />
        )}
      </Stack>

      <EntryOrderDetailDrawer orderId={openedId} onClose={() => setOpened(null)} />
      <LoadDteDialog orderId={dteOrderId} onClose={() => setDteOrderId(null)} />
    </ViewLayout>
  );
};

export default EntryOrdersView;

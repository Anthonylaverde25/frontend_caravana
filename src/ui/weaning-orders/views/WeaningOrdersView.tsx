import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useWeaningOrders } from '@/features/weaning-orders/hooks/useWeaningOrders';
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';
import TransferOrdersStatusFilter, {
  TransferOrderStatusFilterValue
} from '@/ui/transfer-orders/components/TransferOrdersStatusFilter';
import WeaningOrdersTable from '../components/WeaningOrdersTable';
import WeaningOrderDetailDrawer from '../components/WeaningOrderDetailDrawer';
import WeaningOrderIssueDialog from '../components/WeaningOrderIssueDialog';
import WeaningOrderStartDialog from '../components/start/WeaningOrderStartDialog';
import type { WeaningFormMode, WeaningOrderStart } from '../hooks/useWeaningOrderForm';
import { destinationsOf, sourcesOf } from '../components/weaningOrderFormat';

const matchesStatus = (order: WeaningOrderSummary, filter: TransferOrderStatusFilterValue): boolean =>
  filter === 'ALL' ? true : filter === 'OPEN' ? order.is_open : order.status === filter;

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Every weaning order of the company, in every state, and the two ways a weaning starts: ordered
 * before the chute ("Nueva orden de destete") or registered after it ("Registrar destete").
 *
 * `?orderId=` opens an order directly, which is how the births list and the scan link here. On
 * `/new` and `/register` (`starting`) the list sits under the full-screen dialog that starts one.
 */
export const WeaningOrdersView: React.FC<{ starting?: WeaningFormMode }> = ({ starting }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: orders = [], isLoading, isError } = useWeaningOrders();
  const [status, setStatus] = useState<TransferOrderStatusFilterValue>('ALL');
  const [search, setSearch] = useState('');
  const [toIssue, setToIssue] = useState<WeaningOrderSummary | null>(null);
  const [isStarting, setIsStarting] = useState(Boolean(starting));

  useEffect(() => {
    if (starting) setIsStarting(true);
  }, [starting]);

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
        (term === '' || [order.code, sourcesOf(order), destinationsOf(order)].some((text) => normalize(text).includes(term)))
    );
  }, [orders, status, search]);

  return (
    <ViewLayout
      title="Órdenes de Destete"
      subtitle="Todas las órdenes DEST-01: las que se emiten antes de la manga y los destetes registrados después del hecho."
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate('/weaning-orders/register')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2 }}
          >
            Registrar destete
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={() => navigate('/weaning-orders/new')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2.5 }}
          >
            Nueva orden de destete
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <TextField
            size="small"
            placeholder="Buscar por código, rodeo o lote de destete…"
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
            No se pudieron cargar las órdenes de destete.
          </Alert>
        ) : visible.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FuseSvgIcon size={36} color="disabled">
              heroicons-outline:clipboard-document-list
            </FuseSvgIcon>
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
              {orders.length === 0 ? 'Todavía no hay órdenes de destete' : 'Ninguna orden coincide con el filtro'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orders.length === 0
                ? 'Elegí las crías en Partos, o empezá con "Nueva orden de destete" o "Registrar destete".'
                : 'Probá con otro estado o con otra búsqueda.'}
            </Typography>
          </Box>
        ) : (
          <WeaningOrdersTable orders={visible} onOpen={(order) => setOpened(order.id)} onIssue={setToIssue} />
        )}
      </Stack>

      <WeaningOrderDetailDrawer orderId={openedId} onClose={() => setOpened(null)} />
      <WeaningOrderIssueDialog order={toIssue} onClose={() => setToIssue(null)} />
      <WeaningOrderStartDialog
        open={Boolean(starting) && isStarting}
        mode={starting ?? 'order'}
        initial={location.state as WeaningOrderStart | null}
        onClose={() => setIsStarting(false)}
        onExited={() => navigate('/weaning-orders')}
      />
    </ViewLayout>
  );
};

export default WeaningOrdersView;

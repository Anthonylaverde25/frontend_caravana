import React, { useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useWeaningOrders } from '@/features/weaning-orders/hooks/useWeaningOrders';
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';
import TransferOrdersStatusFilter, {
  TransferOrderStatusFilterValue
} from '@/ui/transfer-orders/components/TransferOrdersStatusFilter';
import WeaningOrdersTable from './WeaningOrdersTable';
import WeaningOrderIssueDialog from './WeaningOrderIssueDialog';
import { destinationsOf, sourcesOf } from './weaningOrderFormat';

const matchesStatus = (order: WeaningOrderSummary, filter: TransferOrderStatusFilterValue): boolean =>
  filter === 'ALL' ? true : filter === 'OPEN' ? order.is_open : order.status === filter;

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

interface WeaningOrdersPanelProps {
  onOpen: (order: WeaningOrderSummary) => void;
}

/**
 * Every weaning order of the company, in every state: the register of "Crías al pie y destete".
 * The open ones are worked from the calves at foot; here they are looked up, issued or closed.
 */
export const WeaningOrdersPanel: React.FC<WeaningOrdersPanelProps> = ({ onOpen }) => {
  const { data: orders = [], isLoading, isError } = useWeaningOrders();
  const [status, setStatus] = useState<TransferOrderStatusFilterValue>('ALL');
  const [search, setSearch] = useState('');
  const [toIssue, setToIssue] = useState<WeaningOrderSummary | null>(null);

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
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
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
              ? 'Elegí las crías en "Crías al pie", o empezá con "Nueva orden de destete" o "Registrar destete".'
              : 'Probá con otro estado o con otra búsqueda.'}
          </Typography>
        </Box>
      ) : (
        <WeaningOrdersTable orders={visible} onOpen={onOpen} onIssue={setToIssue} />
      )}

      <WeaningOrderIssueDialog order={toIssue} onClose={() => setToIssue(null)} />
    </Stack>
  );
};

export default WeaningOrdersPanel;

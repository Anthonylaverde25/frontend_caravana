import { Box, Chip, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface BatchServiceHistoryProps {
  orders: ServiceOrder[];
  isLoading: boolean;
  onOpenOrder: (order: ServiceOrder) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'error' }> = {
  DRAFT: { label: 'Borrador', color: 'default' },
  APPROVED: { label: 'En curso', color: 'info' },
  SUCCESS: { label: 'Cerrado', color: 'success' },
  REJECTED: { label: 'Rechazado', color: 'error' },
  CANCELLED: { label: 'Cancelado', color: 'default' },
};

/**
 * Every service the batch went through (one per campaign, newest first). Each service is an
 * order over this batch: the row shows its window and how the exposed group changed while it ran.
 */
export default function BatchServiceHistory({ orders, isLoading, onOpenOrder }: BatchServiceHistoryProps) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:heart</FuseSvgIcon>
        Servicios del Lote
      </Typography>

      {isLoading ? (
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          El lote todavía no tuvo servicios.
        </Typography>
      ) : (
        <Table size="small" sx={{ border: 1, borderColor: 'divider' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Orden</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ventana</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Vientres</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Ingresaron / Salieron</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Preñez</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const exposures = order.female_exposures ?? [];
              const joined = exposures.filter((e) => e.joined_after_start).length;
              const left = exposures.filter((e) => e.exit_reason === 'TRANSFERRED_OUT' || e.exit_reason === 'DEATH' || e.exit_reason === 'SALE').length;
              const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'default' as const };

              return (
                <TableRow key={order.id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpenOrder(order)}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>{order.code}</TableCell>
                  <TableCell>
                    <Chip label={status.label} color={status.color} size="small" variant="outlined" sx={{ fontWeight: 700, height: 22 }} />
                  </TableCell>
                  <TableCell>
                    {order.actual_start_date || order.planned_start_date}
                    {' → '}
                    {order.actual_end_date || order.planned_end_date || 'en curso'}
                  </TableCell>
                  <TableCell align="right">{order.female_caravan_ids.length}</TableCell>
                  <TableCell align="right">{`${joined} / ${left}`}</TableCell>
                  <TableCell align="right">{order.final_pregnancy_rate != null ? `${order.final_pregnancy_rate}%` : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

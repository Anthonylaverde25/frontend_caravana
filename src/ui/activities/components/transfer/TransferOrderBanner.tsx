import React from 'react';
import { Box, Paper, Stack, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { TransferOrder } from '@/features/transfer-orders/types';
import TransferOrderStatusChip, {
  useTransferOrderStatusColor
} from '@/ui/transfer-orders/components/TransferOrderStatusChip';

interface TransferOrderBannerProps {
  order: TransferOrder;
  /** A draft whose screen differs from what was saved. */
  isDirty: boolean;
  /** Other open orders of the same batch, which this screen is not showing. */
  otherOpenCount: number;
}

const formatDateTime = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '';

/**
 * The order the screen is bound to, over the table it describes. It only reports: every action
 * lives in the header, so there is one place to look for what can be done next.
 */
export const TransferOrderBanner: React.FC<TransferOrderBannerProps> = ({ order, isDirty, otherOpenCount }) => {
  const color = useTransferOrderStatusColor()[order.status];

  const route = `${order.source_activity_name ?? 'Origen'} → ${order.destination_activity.name ?? 'Destino'}`;
  const destinations =
    order.destination_mode === 'single'
      ? (order.destinations[0]?.label ?? '')
      : `${order.destinations.length} destino(s)${order.unassigned_head_count > 0 ? ` · ${order.unassigned_head_count} se deciden en la manga` : ''}`;

  const facts: string[] = order.is_editable
    ? ['Sin emitir: no compromete animales y se puede seguir editando']
    : [
        `Emitida ${formatDateTime(order.emitted_at)}`,
        order.printed_at ? `Impresa ${formatDateTime(order.printed_at)}` : 'Sin imprimir',
        ...(order.is_open ? ['La selección y los destinos quedan fijos mientras la orden esté vigente'] : [])
      ];

  if (otherOpenCount > 0) facts.push(`Este lote tiene ${otherOpenCount} orden(es) abierta(s) más`);

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: '8px',
        borderColor: alpha(color, 0.45),
        borderLeft: `4px solid ${color}`,
        bgcolor: alpha(color, 0.05),
        ...(order.is_editable && { borderStyle: 'dashed', borderLeftStyle: 'solid' })
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
        <FuseSvgIcon size={20} sx={{ color }}>
          {order.is_editable ? 'heroicons-outline:document-text' : 'heroicons-outline:clipboard-document-check'}
        </FuseSvgIcon>
        <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.5px' }}>
          {order.code}
        </Typography>
        <TransferOrderStatusChip status={order.status} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {order.planned_head_count} cabezas
          {order.moved_head_count > 0 && ` · ${order.moved_head_count} movidas, faltan ${order.pending_head_count}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {route} · {destinations}
        </Typography>
        {isDirty && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              ml: 'auto',
              px: 1,
              py: 0.25,
              borderRadius: '6px',
              bgcolor: alpha('#e6600d', 0.1),
              color: '#c2410c',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#e6600d' }} />
            Cambios sin guardar
          </Box>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, pl: 3.75 }}>
        {facts.join(' · ')}
      </Typography>
    </Paper>
  );
};

export default TransferOrderBanner;

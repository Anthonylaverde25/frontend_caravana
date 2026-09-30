import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { TRANSFER_ORDER_STATUS_LABELS, TransferOrderHistoryEntry } from '@/features/transfer-orders/types';
import { useTransferOrderStatusColor } from '../TransferOrderStatusChip';
import { formatDateTime } from '../transferOrderFormat';

const describe = (entry: TransferOrderHistoryEntry): string => {
  const to = TRANSFER_ORDER_STATUS_LABELS[entry.to_status];

  if (entry.from_status === null) return `Emitida (${to})`;

  const meta = entry.metadata;

  const done = meta?.moved_now ?? meta?.weaned_now;

  if (done != null) {
    const origin =
      meta?.origin === 'SCREEN'
        ? 'desde la pantalla'
        : meta?.origin === 'REGISTRATION'
          ? 'registrada después del hecho'
          : 'con planilla escaneada';
    const pending = meta?.pending ? `, quedan ${meta.pending}` : '';
    const what = meta?.weaned_now != null ? 'cría(s) destetada(s)' : 'cabeza(s) movida(s)';

    return `Ejecución ${origin}: ${done} ${what}${pending} → ${to}`;
  }

  return entry.from_status === entry.to_status ? to : `${TRANSFER_ORDER_STATUS_LABELS[entry.from_status]} → ${to}`;
};

/**
 * What happened to the order, oldest first: it is what makes "Parcial" readable months later.
 * Shared by transfer and weaning orders, whose history lines are the same.
 */
export const TransferOrderHistoryTimeline: React.FC<{ history: TransferOrderHistoryEntry[] }> = ({ history }) => {
  const colors = useTransferOrderStatusColor();

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Historial
      </Typography>
      <Stack spacing={0} sx={{ mt: 0.5 }}>
        {history.map((entry, index) => (
          <Box key={entry.id} sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.6 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[entry.to_status] }} />
              {index < history.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
            </Box>
            <Box sx={{ pb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {describe(entry)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(entry.created_at)}
                {entry.action_user?.name ? ` · ${entry.action_user.name}` : ''}
              </Typography>
              {entry.reason && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  «{entry.reason}»
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default TransferOrderHistoryTimeline;

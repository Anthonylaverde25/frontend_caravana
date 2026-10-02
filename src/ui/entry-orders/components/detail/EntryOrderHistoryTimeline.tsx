import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ENTRY_ORDER_STATUS_LABELS, EntryOrderHistoryEntry } from '@/features/entry-orders/types';
import { useEntryOrderStatusColor } from '../EntryOrderStatusChip';
import { formatDateTime } from '../entryOrderFormat';

const describe = (entry: EntryOrderHistoryEntry): string => {
  const to = ENTRY_ORDER_STATUS_LABELS[entry.to_status];
  const meta = entry.metadata as { dte_number?: string; head_count?: number; pending?: number; action?: string } | null;

  if (meta?.dte_number) {
    const pending = meta.pending ? `, faltan ${meta.pending}` : '';

    return `DTE ${meta.dte_number}: ${meta.head_count ?? 0} cabeza(s)${pending} → ${to}`;
  }

  if (meta?.action === 'printed') return 'Planilla impresa';
  if (meta?.action === 'draft_updated') return 'Borrador modificado';
  if (entry.from_status === null) return `Creada (${to})`;

  return entry.from_status === entry.to_status ? to : `${ENTRY_ORDER_STATUS_LABELS[entry.from_status]} → ${to}`;
};

/** What happened to the order, oldest first: the purchase, each DTE and how it ended. */
export const EntryOrderHistoryTimeline: React.FC<{ history: EntryOrderHistoryEntry[] }> = ({ history }) => {
  const colors = useEntryOrderStatusColor();

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
                  {entry.reason}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default EntryOrderHistoryTimeline;

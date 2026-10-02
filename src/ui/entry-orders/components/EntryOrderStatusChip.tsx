import React from 'react';
import { Chip, alpha, useTheme } from '@mui/material';
import { ENTRY_ORDER_STATUS_LABELS, EntryOrderStatus } from '@/features/entry-orders/types';

/**
 * One color per state, the same everywhere an entry order is shown: the tray, the detail and the
 * external batches. "En espera de DTE" is the blue of an order somebody is waiting on.
 */
export const useEntryOrderStatusColor = (): Record<EntryOrderStatus, string> => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    DRAFT: isDark ? '#a78bfa' : '#6d28d9',
    AWAITING_DTE: isDark ? '#60a5fa' : '#0a6ed1',
    PARTIAL: isDark ? '#fb923c' : '#e6600d',
    COMPLETED: isDark ? '#34d399' : '#107e3e',
    CLOSED_INCOMPLETE: isDark ? '#fbbf24' : '#a16207',
    CANCELLED: isDark ? '#94a3b8' : '#64748b'
  };
};

export const EntryOrderStatusChip: React.FC<{ status: EntryOrderStatus; size?: 'small' | 'medium' }> = ({ status, size = 'small' }) => {
  const color = useEntryOrderStatusColor()[status];

  return (
    <Chip
      size={size}
      label={ENTRY_ORDER_STATUS_LABELS[status]}
      sx={{
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        color,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: '6px'
      }}
    />
  );
};

export default EntryOrderStatusChip;

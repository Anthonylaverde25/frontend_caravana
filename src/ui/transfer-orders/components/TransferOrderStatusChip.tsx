import React from 'react';
import { Chip, alpha, useTheme } from '@mui/material';
import { TRANSFER_ORDER_STATUS_LABELS, TransferOrderStatus } from '@/features/transfer-orders/types';

/**
 * One color per state, the same everywhere an order is shown: the band on /transfer, the list,
 * the detail and the scan.
 */
export const useTransferOrderStatusColor = (): Record<TransferOrderStatus, string> => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    DRAFT: isDark ? '#a78bfa' : '#6d28d9',
    ISSUED: isDark ? '#60a5fa' : '#0a6ed1',
    PARTIAL: isDark ? '#fb923c' : '#e6600d',
    EXECUTED: isDark ? '#34d399' : '#107e3e',
    CLOSED_INCOMPLETE: isDark ? '#fbbf24' : '#a16207',
    CANCELLED: isDark ? '#94a3b8' : '#64748b'
  };
};

interface TransferOrderStatusChipProps {
  status: TransferOrderStatus;
  size?: 'small' | 'medium';
}

export const TransferOrderStatusChip: React.FC<TransferOrderStatusChipProps> = ({ status, size = 'small' }) => {
  const color = useTransferOrderStatusColor()[status];

  return (
    <Chip
      size={size}
      label={TRANSFER_ORDER_STATUS_LABELS[status]}
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

export default TransferOrderStatusChip;

/** Marks an order registered after the movement had already happened in the field. */
export const TransferOrderKindChip: React.FC<{ size?: 'small' | 'medium' }> = ({ size = 'small' }) => (
  <Chip
    size={size}
    variant="outlined"
    label="Registrada"
    sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}
  />
);

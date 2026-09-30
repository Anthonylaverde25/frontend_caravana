import React from 'react';
import { Box, Button, alpha } from '@mui/material';
import { TRANSFER_ORDER_STATUS_LABELS, TransferOrderStatus } from '@/features/transfer-orders/types';
import { useTransferOrderStatusColor } from './TransferOrderStatusChip';
import { useTransferOrderTableStyles } from './transferOrderFormat';

export type TransferOrderStatusFilterValue = TransferOrderStatus | 'ALL' | 'OPEN';

interface TransferOrdersStatusFilterProps {
  value: TransferOrderStatusFilterValue;
  onChange: (value: TransferOrderStatusFilterValue) => void;
  counts: Record<TransferOrderStatusFilterValue, number>;
}

const ORDER: TransferOrderStatusFilterValue[] = [
  'ALL',
  'OPEN',
  'DRAFT',
  'ISSUED',
  'PARTIAL',
  'EXECUTED',
  'CLOSED_INCOMPLETE',
  'CANCELLED'
];

/**
 * Segmented pills, one per state, each with its count. "Abiertas" groups the two states that
 * still commit animals — the ones somebody has to act on. Drafts commit nothing, so they have a
 * pill of their own and are not "open".
 */
export const TransferOrdersStatusFilter: React.FC<TransferOrdersStatusFilterProps> = ({ value, onChange, counts }) => {
  const colors = useTransferOrderStatusColor();
  const { isDark, border } = useTransferOrderTableStyles();
  const neutral = isDark ? '#60a5fa' : '#0a6ed1';

  const labelOf = (id: TransferOrderStatusFilterValue): string =>
    id === 'ALL' ? 'Todas' : id === 'OPEN' ? 'Abiertas' : TRANSFER_ORDER_STATUS_LABELS[id];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        p: 0.25,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: border,
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
        overflowX: 'auto',
        maxWidth: '100%'
      }}
    >
      {ORDER.map((id) => {
        const isSelected = value === id;
        const color = id === 'ALL' || id === 'OPEN' ? neutral : colors[id];

        return (
          <Button
            key={id}
            size="small"
            onClick={() => onChange(id)}
            sx={{
              minWidth: 0,
              px: 1.25,
              height: 26,
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: isSelected ? 700 : 500,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              color: isSelected ? color : isDark ? '#94a3b8' : '#64748b',
              bgcolor: isSelected ? alpha(color, 0.12) : 'transparent',
              '&:hover': { bgcolor: isSelected ? alpha(color, 0.16) : isDark ? 'rgba(255,255,255,0.07)' : '#edf1f5' }
            }}
          >
            {labelOf(id)} ({counts[id] ?? 0})
          </Button>
        );
      })}
    </Box>
  );
};

export default TransferOrdersStatusFilter;

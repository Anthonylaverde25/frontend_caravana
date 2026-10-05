import React from 'react';
import { Box, Button, alpha } from '@mui/material';
import { ENTRY_ORDER_STATUS_LABELS, EntryOrderStatus } from '@/features/entry-orders/types';
import { useTransferOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';
import { useEntryOrderStatusColor } from './EntryOrderStatusChip';

/** A status, every order, or the ones with incidents still open (whatever their status). */
export type EntryOrderStatusFilterValue = EntryOrderStatus | 'ALL' | 'WITH_INCIDENTS';

const ORDER: EntryOrderStatusFilterValue[] = [
  'ALL',
  'AWAITING_DTE',
  'IN_TRANSIT',
  'DRAFT',
  'COMPLETED',
  'CLOSED_INCOMPLETE',
  'CANCELLED',
  'WITH_INCIDENTS'
];

const labelOf = (id: EntryOrderStatusFilterValue): string =>
  id === 'ALL' ? 'Todas' : id === 'WITH_INCIDENTS' ? 'Con novedades abiertas' : ENTRY_ORDER_STATUS_LABELS[id];

interface EntryOrdersStatusFilterProps {
  value: EntryOrderStatusFilterValue;
  onChange: (value: EntryOrderStatusFilterValue) => void;
  counts: Record<EntryOrderStatusFilterValue, number>;
}

/**
 * Segmented pills, one per state, with "En espera de DTE" and "En tránsito" first: they are the
 * piles somebody has to act on when a document or a truck arrives. The last one gathers the orders
 * with something to settle with the provider.
 */
export const EntryOrdersStatusFilter: React.FC<EntryOrdersStatusFilterProps> = ({ value, onChange, counts }) => {
  const colors = useEntryOrderStatusColor();
  const { isDark, border } = useTransferOrderTableStyles();
  const neutral = isDark ? '#60a5fa' : '#0a6ed1';

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
        const color = id === 'ALL' ? neutral : id === 'WITH_INCIDENTS' ? colors.CLOSED_INCOMPLETE : colors[id];

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

export default EntryOrdersStatusFilter;

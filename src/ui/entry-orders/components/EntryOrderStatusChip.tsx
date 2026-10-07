import React from 'react';
import { Box, Chip, Tooltip, alpha, useTheme } from '@mui/material';
import { ENTRY_ORDER_STATUS_LABELS, EntryOrderStatus } from '@/features/entry-orders/types';

/**
 * One color per state, the same everywhere an entry order is shown: the tray, the detail and the
 * external batches. "En espera de DTE" is the blue of an order somebody is waiting on; "En
 * tránsito" the orange of animals on the road; "Recibida · por identificar" the amber of work still
 * to do — the animals arrived, their caravans are not written yet.
 */
export const useEntryOrderStatusColor = (): Record<EntryOrderStatus, string> => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    DRAFT: isDark ? '#a78bfa' : '#6d28d9',
    AWAITING_DTE: isDark ? '#60a5fa' : '#0a6ed1',
    IN_TRANSIT: isDark ? '#fb923c' : '#e6600d',
    RECEIVED: isDark ? '#facc15' : '#b45309',
    COMPLETED: isDark ? '#34d399' : '#107e3e',
    CLOSED_INCOMPLETE: isDark ? '#fbbf24' : '#a16207',
    CANCELLED: isDark ? '#94a3b8' : '#64748b'
  };
};

/** The counters the chip reads to tell how far the order got. */
export interface EntryOrderProgress {
  head_count: number;
  with_dte_count: number;
  in_transit_count: number;
  /** Head received by count whose caravan is still to write. */
  uncaravaned_count?: number;
  open_incidents_count: number;
  /** Null on a draft never confirmed: cancelled, it was discarded, not a purchase that fell through. */
  confirmed_at?: string | null;
}

/** A draft thrown away before confirming: nothing was bought, so it is not an "Anulada" purchase. */
export const isDiscardedDraft = (status: EntryOrderStatus, progress?: EntryOrderProgress): boolean =>
  status === 'CANCELLED' && progress !== undefined && progress.confirmed_at === null;

/**
 * The status says what the order waits for; the progress how far it got: "En espera de DTE · 25
 * de 40" once some DTE arrived, "En tránsito · 15 por recibir", "Recibida · 10 por identificar".
 */
export const entryOrderStatusLabel = (status: EntryOrderStatus, progress?: EntryOrderProgress): string => {
  const base = ENTRY_ORDER_STATUS_LABELS[status];

  if (!progress) return base;
  if (isDiscardedDraft(status, progress)) return 'Descartado';
  if (status === 'AWAITING_DTE' && progress.with_dte_count > 0) return `${base} · ${progress.with_dte_count} de ${progress.head_count}`;
  if (status === 'IN_TRANSIT') return `${base} · ${progress.in_transit_count} por recibir`;
  if (status === 'RECEIVED') return `Recibida · ${progress.uncaravaned_count ?? 0} por identificar`;

  return base;
};

interface EntryOrderStatusChipProps {
  status: EntryOrderStatus;
  size?: 'small' | 'medium';
  progress?: EntryOrderProgress;
}

export const EntryOrderStatusChip: React.FC<EntryOrderStatusChipProps> = ({ status, size = 'small', progress }) => {
  const colors = useEntryOrderStatusColor();
  const color = colors[status];
  const incidents = progress?.open_incidents_count ?? 0;
  const warn = colors.CLOSED_INCOMPLETE;

  const chip = (
    <Chip
      size={size}
      label={entryOrderStatusLabel(status, progress)}
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

  if (incidents === 0) return chip;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      {chip}
      <Tooltip title="Hay que revisarlas con el proveedor; no frenan la orden.">
        <Chip
          size="small"
          label={incidents === 1 ? '1 novedad' : `${incidents} novedades`}
          sx={{
            fontWeight: 700,
            fontSize: '0.68rem',
            color: warn,
            bgcolor: alpha(warn, 0.1),
            border: `1px dashed ${alpha(warn, 0.5)}`,
            borderRadius: '6px'
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default EntryOrderStatusChip;

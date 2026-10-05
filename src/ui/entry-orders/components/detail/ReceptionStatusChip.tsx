import React from 'react';
import { Chip, Tooltip, alpha, useTheme } from '@mui/material';
import type { EntryOrderAnimal } from '@/features/entry-orders/types';
import { formatDate } from '../entryOrderFormat';

/** Whether a caravan of a DTE arrived, and how and when it was received. */
export const ReceptionStatusChip: React.FC<{ animal: Pick<EntryOrderAnimal, 'reception_status' | 'reception_status_label' | 'received_at' | 'reception_method'> }> = ({
  animal
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = {
    PENDING: isDark ? '#fb923c' : '#e6600d',
    RECEIVED: isDark ? '#34d399' : '#107e3e',
    MISSING: isDark ? '#94a3b8' : '#64748b'
  }[animal.reception_status];
  const how = animal.reception_method === 'CHUTE' ? 'en manga' : animal.reception_method === 'SHEET' ? 'con planilla ING-03' : 'a mano';

  const chip = (
    <Chip
      size="small"
      label={animal.reception_status_label}
      sx={{ fontWeight: 700, fontSize: '0.68rem', color, bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.3)}`, borderRadius: '6px' }}
    />
  );

  return animal.reception_status === 'RECEIVED' && animal.received_at ? (
    <Tooltip title={`Recibida ${how} el ${formatDate(animal.received_at)}`}>{chip}</Tooltip>
  ) : (
    chip
  );
};

export default ReceptionStatusChip;

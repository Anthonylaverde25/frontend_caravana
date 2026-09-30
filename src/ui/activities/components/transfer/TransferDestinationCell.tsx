import React from 'react';
import { MenuItem, TextField, Typography } from '@mui/material';
import type { Cact01Destination } from '@/ui/work-templates/components/scan/types';

interface TransferDestinationCellProps {
  caravanId: number;
  assignedKey: string | undefined;
  destinations: Cact01Destination[];
  onAssign: (caravanId: number, key: string | null) => void;
  disabled?: boolean;
}

/**
 * The destination of one animal, in its own file rather than inline in the table.
 *
 * `TransferAnimalsTable` is already 710 lines, far past the 250 the project allows, so the
 * column that this feature adds does not get to make it worse.
 *
 * "Sin asignar" is a legitimate answer, not an empty one: it means the operator will write
 * the batch at the chute, and the sheet prints that cell blank on purpose.
 */
export const TransferDestinationCell: React.FC<TransferDestinationCellProps> = ({
  caravanId,
  assignedKey,
  destinations,
  onAssign,
  disabled = false,
}) => {
  if (destinations.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        Declarar un destino primero
      </Typography>
    );
  }

  const value = assignedKey && destinations.some((d) => d.key === assignedKey) ? assignedKey : '';

  return (
    <TextField
      select
      size="small"
      fullWidth
      value={value}
      disabled={disabled}
      onChange={(e) => onAssign(caravanId, e.target.value || null)}
      SelectProps={{ displayEmpty: true }}
      sx={{ minWidth: 170 }}
    >
      <MenuItem value="">
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Sin asignar (en la manga)
        </Typography>
      </MenuItem>
      {destinations.map((destination) => (
        <MenuItem key={destination.key} value={destination.key}>
          {destination.name.trim() || 'Destino sin nombre'}
          {destination.mode === 'new' ? ' (nuevo)' : ''}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TransferDestinationCell;

import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { TransferDestinationsState } from '@/ui/activities/hooks/useTransferDestinations';
import type { RegisterDestinationsState } from '../../../hooks/useRegisterDestinations';

interface RegisterDestinationsSummaryProps {
  perAnimal: TransferDestinationsState;
  state: RegisterDestinationsState;
  selectedIds: number[];
}

/**
 * Where the selected animals go, in one line. The batches are picked in each row; this only
 * adds them up, and lets a new batch be edited or dropped.
 */
export const RegisterDestinationsSummary: React.FC<RegisterDestinationsSummaryProps> = ({
  perAnimal,
  state,
  selectedIds
}) => {
  const countOf = (key: string) => selectedIds.filter((id) => perAnimal.assignments[id] === key).length;
  const shown = perAnimal.destinations.filter((d) => d.mode === 'new' || countOf(d.key) > 0);
  const unassigned = perAnimal.unassignedCount(selectedIds);

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: '8px',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap'
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mr: 0.5 }}>
        Destinos
      </Typography>

      {shown.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Elegí el lote de cada animal en la columna Lote destino. Ahí mismo podés crear uno nuevo.
        </Typography>
      )}

      {shown.map((destination) => (
        <Chip
          key={destination.key}
          size="small"
          variant={destination.mode === 'new' ? 'outlined' : 'filled'}
          label={`${destination.name.trim() || 'Sin nombre'}${destination.mode === 'new' ? ' (nuevo)' : ''} · ${countOf(destination.key)} cab.`}
          onClick={destination.mode === 'new' ? () => state.requestEdit(destination) : undefined}
          onDelete={destination.mode === 'new' ? () => state.removeNew(destination.key) : undefined}
          icon={destination.mode === 'new' ? <FuseSvgIcon size={14}>heroicons-outline:pencil-square</FuseSvgIcon> : undefined}
          sx={{ fontWeight: 600 }}
        />
      ))}

      {unassigned > 0 && selectedIds.length > 0 && (
        <Box component="span" sx={{ ml: 'auto' }}>
          <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
            {unassigned} sin lote
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RegisterDestinationsSummary;

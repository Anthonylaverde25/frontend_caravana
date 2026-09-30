import React, { useState } from 'react';
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';

interface WeaningPerAnimalAssignBarProps {
  form: WeaningOrderFormState;
  destinationLabels: Map<string, string>;
  /** Calves ticked in the table. */
  selected: number[];
  onAssigned: () => void;
}

/**
 * The batch of each calf, when there is one per calf: how many each batch has so far, and the
 * batch given at once to the calves ticked in the table (each row can still change its own).
 */
export const WeaningPerAnimalAssignBar: React.FC<WeaningPerAnimalAssignBarProps> = ({ form, destinationLabels, selected, onAssigned }) => {
  const [target, setTarget] = useState('');
  const register = form.mode === 'register';
  const countOf = (key: string | null) => form.calfIds.filter((id) => (form.calves[id]?.destinationKey ?? null) === key).length;
  const unassigned = countOf(null);

  const assign = () => {
    selected.forEach((id) => form.updateCalf(id, { destinationKey: target || null }));
    onAssigned();
  };

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={1.5}
      alignItems={{ lg: 'center' }}
      justifyContent="space-between"
      sx={{ p: 1.5, mb: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {form.activeDestinations.map((d) => (
          <Chip key={d.key} size="small" label={`${destinationLabels.get(d.key) || 'Lote sin nombre'} · ${countOf(d.key)}`} sx={{ fontWeight: 600 }} />
        ))}
        <Chip
          size="small"
          variant="outlined"
          color={register && unassigned > 0 ? 'error' : 'default'}
          label={`Sin lote · ${unassigned}${register ? '' : ' (se decide en la manga)'}`}
        />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {selected.length === 0 ? 'Marcá crías en la tabla para asignarles un lote' : `${selected.length} marcada(s):`}
        </Typography>
        <Box sx={{ minWidth: 200 }}>
          <TextField
            select
            size="small"
            fullWidth
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={selected.length === 0}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Sin lote</MenuItem>
            {form.activeDestinations.map((d) => (
              <MenuItem key={d.key} value={d.key}>
                {destinationLabels.get(d.key) || 'Lote sin nombre'}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Button
          variant="outlined"
          size="small"
          disabled={selected.length === 0}
          onClick={assign}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', height: 36 }}
        >
          Asignar
        </Button>
      </Stack>
    </Stack>
  );
};

export default WeaningPerAnimalAssignBar;

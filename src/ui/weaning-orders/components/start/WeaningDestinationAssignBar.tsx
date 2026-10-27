import React, { useState } from 'react';
import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { DestinationChoice } from './useCalfDestinations';

type Scope = 'ALL' | 'M' | 'H';

interface WeaningDestinationAssignBarProps {
  /** The calves picked for the order. */
  calves: BirthHistoryRecord[];
  choices: DestinationChoice[];
  /** What a calf without a batch means: decided at the chute (orders) or still to choose (registers). */
  emptyLabel: string;
  /** Registering a weaning that happened: a calf without a batch is missing it. */
  required: boolean;
  refOf: (calfId: number) => string | null;
  onAssign: (calfIds: number[], ref: string | null) => void;
}

/**
 * How many picked calves each batch has, and one batch given at once to the picked calves — all of
 * them, or only the males or the females, the usual split at weaning. Each row can still change its own.
 */
export const WeaningDestinationAssignBar: React.FC<WeaningDestinationAssignBarProps> = ({
  calves,
  choices,
  emptyLabel,
  required,
  refOf,
  onAssign
}) => {
  const [scope, setScope] = useState<Scope>('ALL');
  const [target, setTarget] = useState('');
  const inScope = calves.filter((c) => scope === 'ALL' || c.calf_sex === scope);
  const countOf = (ref: string | null) => calves.filter((c) => refOf(c.calf_id) === ref).length;
  const unassigned = countOf(null);
  const males = calves.filter((c) => c.calf_sex === 'M').length;
  const females = calves.filter((c) => c.calf_sex === 'H').length;

  return (
    <Stack
      direction={{ xs: 'column', xl: 'row' }}
      spacing={1.5}
      alignItems={{ xl: 'center' }}
      justifyContent="space-between"
      sx={{ px: 1.5, py: 1, borderRadius: '6px', border: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {choices.map((choice) => (
          <Chip key={choice.ref} size="small" label={`${choice.label} · ${countOf(choice.ref)}`} sx={{ fontWeight: 600 }} />
        ))}
        <Chip
          size="small"
          variant="outlined"
          color={required && unassigned > 0 ? 'error' : 'default'}
          label={`Sin lote · ${unassigned}${required ? '' : ` (${emptyLabel.toLowerCase()})`}`}
        />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" label="Asignar a" value={scope} onChange={(e) => setScope(e.target.value as Scope)} sx={{ minWidth: 190 }}>
          <MenuItem value="ALL">Todas las marcadas ({calves.length})</MenuItem>
          <MenuItem value="M">♂ Machos marcados ({males})</MenuItem>
          <MenuItem value="H">♀ Hembras marcadas ({females})</MenuItem>
        </TextField>
        <Box sx={{ minWidth: 200 }}>
          <TextField
            select
            size="small"
            fullWidth
            label="Lote destino"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Sin lote</MenuItem>
            {choices.map((choice) => (
              <MenuItem key={choice.ref} value={choice.ref}>
                {choice.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onAssign(inScope.map((c) => c.calf_id), target || null)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', height: 38, whiteSpace: 'nowrap' }}
        >
          Asignar ({inScope.length})
        </Button>
      </Stack>
    </Stack>
  );
};

export default WeaningDestinationAssignBar;

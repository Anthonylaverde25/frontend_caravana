import React from 'react';
import { Alert, Autocomplete, Box, Chip, MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ManagementSystemSelector from '@/ui/batches/components/create/ManagementSystemSelector';
import type { Cact01BatchOption } from '../../hooks/useCact01Destinations';
import type { Cact01Destination } from './types';

interface ActivityOption {
  id: number;
  name: string;
  code: string;
}

interface BatchTypeOption {
  id: number;
  name: string;
  activity_id?: number | null;
  is_selectable?: boolean;
}

interface ScanCact01DestinationCardProps {
  destination: Cact01Destination;
  count: number;
  isDuplicated: boolean;
  batches: Cact01BatchOption[];
  activities: ActivityOption[];
  batchTypes: BatchTypeOption[];
  onChange: (patch: Partial<Cact01Destination>) => void;
}

const NON_PRODUCTIVE_ACTIVITY = 'INTERNAL';

/**
 * One destination read off the sheet, with the animals that fall to it.
 *
 * The count is the point of the card: a group of one where there should be thirty is how
 * a misread batch name announces itself before anything is written.
 *
 * A batch that already exists is never reconfigured from here — the sheet does not get
 * to change what a batch is. A batch to be created gets its activity, type and
 * management system here, because the paper only ever carried a name.
 */
export const ScanCact01DestinationCard: React.FC<ScanCact01DestinationCardProps> = ({
  destination,
  count,
  isDuplicated,
  batches,
  activities,
  batchTypes,
  onChange,
}) => {
  const selectedBatch = batches.find((batch) => batch.id === destination.batchId) ?? null;
  const selectedActivity = activities.find((activity) => activity.id === destination.activityId);
  const declaresManagement = Boolean(selectedActivity) && selectedActivity?.code !== NON_PRODUCTIVE_ACTIVITY;

  const compatibleTypes = batchTypes.filter(
    (type) =>
      type.is_selectable !== false &&
      (destination.activityId == null || type.activity_id === destination.activityId || type.activity_id == null)
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', borderColor: isDuplicated ? 'error.main' : 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
        <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {destination.key === '' ? '(sin destino)' : destination.label}
        </Typography>
        <Chip size="small" color={count > 0 ? 'primary' : 'default'} label={`${count} animales`} sx={{ fontWeight: 700 }} />
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={destination.mode}
          onChange={(_, mode) => mode && onChange({ mode })}
        >
          <ToggleButton value="existing" sx={{ textTransform: 'none', fontWeight: 700 }}>Lote existente</ToggleButton>
          <ToggleButton value="new" sx={{ textTransform: 'none', fontWeight: 700 }}>Crear lote nuevo</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {isDuplicated && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: '6px', fontSize: '0.75rem' }}>
          Este destino apunta al mismo lote que otro. Uní los dos grupos en uno solo.
        </Alert>
      )}

      {destination.mode === 'existing' ? (
        <Stack spacing={1.5}>
          <Autocomplete
            options={batches}
            value={selectedBatch}
            onChange={(_, batch) =>
              onChange({ batchId: batch?.id ?? null, name: batch?.name ?? '', activityId: batch?.activityId ?? null, isConfined: batch?.isConfined ?? null })
            }
            getOptionLabel={(option) => `${option.name} — ${option.activityName}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Lote de destino" size="small" />}
          />

          {selectedBatch && selectedBatch.isConfined == null && (
            <Alert severity="info" sx={{ borderRadius: '6px', fontSize: '0.72rem' }}>
              El lote "{selectedBatch.name}" no tiene declarado el sistema de manejo. La planilla no lo completa:
              se cambia desde el lote, en Actividades.
            </Alert>
          )}
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <TextField
            label="Nombre del lote nuevo"
            size="small"
            value={destination.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Actividad"
              size="small"
              fullWidth
              value={destination.activityId ?? ''}
              onChange={(e) => onChange({ activityId: Number(e.target.value) || null, batchTypeId: null })}
            >
              {activities.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>{activity.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Tipo de lote"
              size="small"
              fullWidth
              value={destination.batchTypeId ?? ''}
              onChange={(e) => onChange({ batchTypeId: Number(e.target.value) || null })}
              disabled={destination.activityId == null}
            >
              {compatibleTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {declaresManagement && (
            <ManagementSystemSelector
              value={destination.isConfined ?? undefined}
              onChange={(isConfined) => onChange({ isConfined })}
            />
          )}
        </Stack>
      )}
    </Paper>
  );
};

export default ScanCact01DestinationCard;

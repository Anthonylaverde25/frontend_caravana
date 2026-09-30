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
  /** The destination activity of the whole sheet. Every batch on this card lives inside it. */
  destinationActivityId: number | null;
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
 * to change what a batch is. A batch to be created gets its type and management system
 * here, because the paper only ever carried a name.
 *
 * What the card does NOT ask is the activity. That is declared once for the whole sheet and
 * every destination inherits it, so the batches of one movement cannot end up scattered
 * across productive stages. It is shown, not chosen.
 */
export const ScanCact01DestinationCard: React.FC<ScanCact01DestinationCardProps> = ({
  destination,
  count,
  isDuplicated,
  batches,
  activities,
  batchTypes,
  destinationActivityId,
  onChange,
}) => {
  // Only batches of the destination activity can be picked. This is the rule itself, not a
  // convenience: a flat list of every batch of the company is how a movement used to land in
  // the wrong productive stage without anybody declaring it.
  const eligibleBatches = batches.filter(
    (batch) => destinationActivityId == null || batch.activityId === destinationActivityId
  );

  const selectedBatch = eligibleBatches.find((batch) => batch.id === destination.batchId) ?? null;
  const activityId = destinationActivityId ?? destination.activityId;
  const selectedActivity = activities.find((activity) => activity.id === activityId);
  const declaresManagement = Boolean(selectedActivity) && selectedActivity?.code !== NON_PRODUCTIVE_ACTIVITY;

  const compatibleTypes = batchTypes.filter(
    (type) =>
      type.is_selectable !== false &&
      (activityId == null || type.activity_id === activityId || type.activity_id == null)
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
          // Switching to "create" carries the sheet's activity into the new batch: the card
          // no longer asks for it, so nothing else would put it there.
          onChange={(_, mode) =>
            mode &&
            onChange(
              mode === 'new'
                ? { mode, batchId: null, activityId: destinationActivityId ?? destination.activityId }
                : { mode }
            )
          }
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
            options={eligibleBatches}
            value={selectedBatch}
            onChange={(_, batch) =>
              onChange({ batchId: batch?.id ?? null, name: batch?.name ?? '', activityId: batch?.activityId ?? null, isConfined: batch?.isConfined ?? null })
            }
            // Every option belongs to the same activity, so naming it in the label says
            // nothing. The management system does: it is what tells two of them apart.
            getOptionLabel={(option) =>
              `${option.name}${option.isConfined === true ? ' — corral' : option.isConfined === false ? ' — pastura' : ''}`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={
              destinationActivityId == null
                ? 'Primero declará la actividad de destino'
                : `No hay lotes abiertos en ${selectedActivity?.name ?? 'esa actividad'}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Lote de destino"
                size="small"
                helperText={
                  selectedActivity ? `Sólo lotes de ${selectedActivity.name}` : 'Declará la actividad de destino'
                }
              />
            )}
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            {/* The activity is the sheet's, not this card's: shown so it is unmistakable
                where the batch is being born, and not editable here. */}
            <TextField
              label="Actividad"
              size="small"
              fullWidth
              value={selectedActivity?.name ?? 'Sin declarar'}
              InputProps={{ readOnly: true }}
              helperText="Definida para toda la planilla"
            />

            <TextField
              select
              label="Tipo de lote"
              size="small"
              fullWidth
              value={destination.batchTypeId ?? ''}
              onChange={(e) => onChange({ batchTypeId: Number(e.target.value) || null })}
              disabled={activityId == null}
              helperText={
                activityId == null ? 'Falta la actividad de destino' : 'Lo único que el papel no puede traer'
              }
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

import React from 'react';
import { Box, Divider, ListSubheader, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { TransferPrefillDestination } from '@/ui/activities/components/transfer/transferPrefill';
import type { TransferFormActivity } from '../../hooks/useTransferOrderFormOptions';
import { headCountLabel, transferSelectFieldProps } from './transferFormFieldProps';

interface TransferOrderDestinationFieldsProps {
  activities: TransferFormActivity[];
  activityId: number | '';
  onActivityChange: (activityId: number | '') => void;
  destination: TransferPrefillDestination | null;
  onDestinationChange: (destination: TransferPrefillDestination | null) => void;
  /** Never offered as its own destination. */
  sourceBatchId: number | '';
  /** What "Un destino por animal" and "Lote nuevo" mean where this is used. */
  perAnimalHelper?: string;
  newBatchHelper?: string;
}

const NEW_BATCH = 'new';
const PER_ANIMAL = 'per_animal';
const BATCH_PREFIX = 'batch:';

const encode = (destination: TransferPrefillDestination | null): string =>
  destination == null ? '' : destination.kind === 'existing' ? `${BATCH_PREFIX}${destination.batchId}` : destination.kind;

const decode = (value: string): TransferPrefillDestination | null => {
  if (value === NEW_BATCH) return { kind: 'new' };

  if (value === PER_ANIMAL) return { kind: 'per_animal' };

  if (value.startsWith(BATCH_PREFIX)) return { kind: 'existing', batchId: Number(value.slice(BATCH_PREFIX.length)) };

  return null;
};

/**
 * Where the animals go: the destination activity first, then a batch of that activity. Because
 * the list is cut to the declared activity, the destination batch always belongs to it. A batch
 * that does not exist yet, or one destination per animal, is decided on the transfer screen.
 */
export const TransferOrderDestinationFields: React.FC<TransferOrderDestinationFieldsProps> = ({
  activities,
  activityId,
  onActivityChange,
  destination,
  onDestinationChange,
  sourceBatchId,
  perAnimalHelper = 'Cada animal recibe su lote en la pantalla de transferencia.',
  newBatchHelper = 'El lote nuevo se configura en la pantalla de transferencia.'
}) => {
  const batches = (activities.find((activity) => activity.id === activityId)?.batches ?? []).filter(
    (batch) => batch.id !== sourceBatchId
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.5 }}>
        Destino
      </Typography>

      <TextField
        {...transferSelectFieldProps}
        required
        label="Actividad de destino"
        value={activityId}
        onChange={(e) => onActivityChange(e.target.value === '' ? '' : Number(e.target.value))}
      >
        {activities.map((activity) => (
          <MenuItem key={activity.id} value={activity.id}>
            {activity.name} ({activity.batches.length} {activity.batches.length === 1 ? 'lote' : 'lotes'})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        {...transferSelectFieldProps}
        required
        disabled={activityId === ''}
        label="Lote de destino"
        value={encode(destination)}
        onChange={(e) => onDestinationChange(decode(e.target.value))}
        helperText={
          activityId === ''
            ? 'Primero elegí la actividad de destino.'
            : destination?.kind === 'new'
              ? newBatchHelper
              : destination?.kind === 'per_animal'
                ? perAnimalHelper
                : undefined
        }
      >
        <MenuItem value={NEW_BATCH}>Lote nuevo</MenuItem>
        <MenuItem value={PER_ANIMAL}>Un destino por animal</MenuItem>
        <Divider />
        <ListSubheader sx={{ lineHeight: '32px', fontSize: '0.72rem', fontWeight: 700 }}>Lotes existentes</ListSubheader>
        {batches.length === 0 && (
          <MenuItem disabled>
            <em>No hay otros lotes en esta actividad</em>
          </MenuItem>
        )}
        {batches.map((batch) => (
          <MenuItem key={batch.id} value={`${BATCH_PREFIX}${batch.id}`}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
              <span>{batch.name}</span>
              <Typography component="span" variant="caption" color="text.secondary">
                {headCountLabel(batch.count)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};

export default TransferOrderDestinationFields;

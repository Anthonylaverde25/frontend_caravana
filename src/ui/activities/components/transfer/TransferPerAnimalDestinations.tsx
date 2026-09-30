import React from 'react';
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScanCact01DestinationCard from '@/ui/work-templates/components/scan/ScanCact01DestinationCard';
import type { Cact01BatchOption } from '@/ui/work-templates/hooks/useCact01Destinations';
import type { TransferDestinationsState } from '../../hooks/useTransferDestinations';

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

interface TransferPerAnimalDestinationsProps {
  state: TransferDestinationsState;
  caravanIds: number[];
  batches: Cact01BatchOption[];
  activities: ActivityOption[];
  batchTypes: BatchTypeOption[];
  /** Declared once for the movement, in the band above; every card here is confined to it. */
  destinationActivityId: number | null;
  /** An issued order froze these destinations: they are read, not edited. */
  readOnly?: boolean;
}

/**
 * Declares the destinations of a per-animal transfer.
 *
 * Reuses `ScanCact01DestinationCard`, the card the scan screen uses to resolve a
 * destination read off paper: asking for a batch — existing, or new with its activity,
 * type and management system — is the same question here, so it is not rebuilt.
 *
 * The head count on each card is the part that earns its place: a destination holding one
 * animal where it should hold thirty is how a misassignment announces itself before
 * anything moves.
 */
export const TransferPerAnimalDestinations: React.FC<TransferPerAnimalDestinationsProps> = ({
  state,
  caravanIds,
  batches,
  activities,
  batchTypes,
  destinationActivityId,
  readOnly = false,
}) => {
  const unassigned = state.unassignedCount(caravanIds);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
          Destinos del movimiento ({state.destinations.length})
        </Typography>
        {unassigned > 0 && (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={`${unassigned} sin asignar`}
            sx={{ fontWeight: 700 }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        {!readOnly && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={state.add}
            disabled={destinationActivityId == null}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Agregar destino
          </Button>
        )}
      </Stack>

      {state.destinations.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '6px', fontSize: '0.8rem' }}>
          Agregá al menos un destino para poder asignar animales. Si preferís que el lote de cada animal
          se decida en la manga, podés imprimir la planilla con la columna en blanco sin declarar nada acá.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {state.destinations.map((destination) => (
            <Box key={destination.key} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1 }} inert={readOnly}>
                <ScanCact01DestinationCard
                  destination={destination}
                  count={state.countOf(destination.key, caravanIds)}
                  isDuplicated={false}
                  batches={batches}
                  activities={activities}
                  batchTypes={batchTypes}
                  destinationActivityId={destinationActivityId}
                  onChange={(patch) => state.update(destination.key, patch)}
                />
              </Box>
              {!readOnly && (
                <Tooltip title="Quitar destino">
                  <IconButton size="small" onClick={() => state.remove(destination.key)} sx={{ mt: 1 }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Stack>
      )}

      {unassigned > 0 && state.destinations.length > 0 && (
        <Alert severity="info" sx={{ mt: 1.5, borderRadius: '6px', fontSize: '0.78rem' }}>
          Quedan {unassigned} animal(es) sin destino asignado. Es una decisión válida: la planilla sale con
          esa columna en blanco para completarla en la manga, y el movimiento se registra al escanearla.
        </Alert>
      )}
    </Paper>
  );
};

export default TransferPerAnimalDestinations;

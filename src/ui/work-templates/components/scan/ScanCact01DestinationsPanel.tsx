import React from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import ScanCact01DestinationCard from './ScanCact01DestinationCard';
import type { Cact01BatchOption, Cact01DestinationsState } from '../../hooks/useCact01Destinations';
import type { Cact01HeaderError } from './types';

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

interface ScanCact01DestinationsPanelProps {
  state: Cact01DestinationsState;
  batches: Cact01BatchOption[];
  activities: ActivityOption[];
  batchTypes: BatchTypeOption[];
  headerErrors?: Cact01HeaderError[];
}

/**
 * The piece that makes one template cover both ways of working.
 *
 * With a single destination there is one card and the panel reads as simply as DEST-01's
 * batch picker; with a destination per animal there are N. Either way the sheet only
 * ever carried names, and the configuration of every batch to be created is declared
 * here, on screen, where somebody can be held to it.
 */
export const ScanCact01DestinationsPanel: React.FC<ScanCact01DestinationsPanelProps> = ({
  state,
  batches,
  activities,
  batchTypes,
  headerErrors = [],
}) => {
  const destinationErrors = headerErrors.filter((error) => error.field === 'destinations');

  return (
    <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ pl: 1.5, borderLeft: '3px solid #0a6ed1' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
            Destinos leídos ({state.destinations.length})
          </Typography>
        </Box>
      </Stack>

      {destinationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>
          <Stack spacing={0.5}>
            {destinationErrors.map((error) => (
              <span key={`${error.code}-${error.message}`}>{error.message}</span>
            ))}
          </Stack>
        </Alert>
      )}

      {state.blockingIssues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '6px' }}>
          <Stack spacing={0.5}>
            {state.blockingIssues.map((issue) => (
              <span key={issue}>{issue}</span>
            ))}
          </Stack>
        </Alert>
      )}

      {state.destinations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Todavía no se leyó ningún lote de destino. Cargá al menos una hoja.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {state.destinations.map((destination) => (
            <ScanCact01DestinationCard
              key={destination.key}
              destination={destination}
              count={state.countOf(destination.key)}
              isDuplicated={state.duplicatedKeys.has(destination.key)}
              batches={batches}
              activities={activities}
              batchTypes={batchTypes}
              onChange={(patch) => state.update(destination.key, patch)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ScanCact01DestinationsPanel;

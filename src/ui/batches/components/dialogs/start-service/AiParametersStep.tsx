import { Alert, Box, Paper, Stack, TextField, Typography } from '@mui/material';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';

interface AiParametersStepProps {
  batchName: string;
  femaleCount: number;
  plannedStraws: Record<number, number>;
  byId: Map<number, SemenOption>;
  plannedStartDate: string;
  setPlannedStartDate: (value: string) => void;
  observations: string;
  setObservations: (value: string) => void;
}

/** Last step of an AI service (semen S-B): the day it starts and notes; no bulls, no window. */
export default function AiParametersStep({
  batchName,
  femaleCount,
  plannedStraws,
  byId,
  plannedStartDate,
  setPlannedStartDate,
  observations,
  setObservations,
}: AiParametersStepProps) {
  const planned = Object.entries(plannedStraws);
  const startsNow = plannedStartDate !== '' && plannedStartDate <= new Date().toISOString().split('T')[0];

  return (
    <Stack spacing={2.5}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: '8px', border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Lote</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{batchName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Vientres a inseminar</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{femaleCount} cabezas</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Semen previsto</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {planned.length === 0
                ? 'Se decide en la manga'
                : planned.map(([itemId, straws]) => `${byId.get(Number(itemId))?.label ?? itemId} (${straws})`).join(' · ')}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <TextField
        label="Fecha de inicio del servicio"
        type="date"
        fullWidth
        value={plannedStartDate}
        onChange={(e) => setPlannedStartDate(e.target.value)}
        variant="filled"
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
      />
      <TextField
        label="Observaciones"
        fullWidth
        multiline
        rows={3}
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        variant="filled"
        placeholder="Ej: IATF con protocolo de 7 días; repaso con toros a los 10 días."
        InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
      />
      <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
        No se mueve ningún animal ni se reservan pajuelas.{' '}
        {startsNow
          ? 'Al iniciar se abre la carga de inseminaciones: cada una descuenta sus pajuelas del termo.'
          : 'Las inseminaciones se cargan desde la bandeja de tacto, el día que se hagan.'}
      </Alert>
    </Stack>
  );
}

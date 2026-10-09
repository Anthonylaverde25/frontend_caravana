import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface ReplacementDestinationStepProps {
  batches: Batch[];
  destinationBatchId: number | null;
  onDestinationBatchChange: (id: number | null) => void;
  defaultDonorBatch: Batch | null;
  reason: string;
  replacementDate: string;
  onReplacementDateChange: (date: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const ReplacementDestinationStep: React.FC<ReplacementDestinationStepProps> = ({
  batches,
  destinationBatchId,
  onDestinationBatchChange,
  defaultDonorBatch,
  reason,
  replacementDate,
  onReplacementDateChange,
  notes,
  onNotesChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDeath = reason === 'DEATH';

  return (
    <Stack spacing={2.5}>
      {/* Sección 1: Destino Físico del Reproductor Saliente */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Lote de Destino del Reproductor Saliente *
          </Typography>
          {defaultDonorBatch && !isDeath && (
            <Chip
              icon={<FuseSvgIcon size={14}>heroicons-outline:arrow-uturn-left</FuseSvgIcon>}
              label={`Origen previo: ${defaultDonorBatch.name}`}
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onDestinationBatchChange(defaultDonorBatch.id)}
              sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer' }}
            />
          )}
        </Stack>

        {isDeath ? (
          <Alert
            severity="info"
            icon={<FuseSvgIcon size={20}>heroicons-outline:information-circle</FuseSvgIcon>}
            sx={{ borderRadius: '8px' }}
          >
            Al registrarse el motivo <strong>Muerte en Potrero</strong>, el reproductor no será trasladado a ningún lote físico y se asentará su baja definitiva.
          </Alert>
        ) : (
          <TextField
            select
            fullWidth
            variant="filled"
            label="Seleccione el lote a donde será trasladado"
            value={destinationBatchId ?? ''}
            onChange={(e) => onDestinationBatchChange(e.target.value ? Number(e.target.value) : null)}
            helperText={
              destinationBatchId === defaultDonorBatch?.id
                ? 'El toro retornará a su lote de descanso original de donde provino.'
                : 'Puede derivarlo a un Lote de Enfermería, Hospital o Cuarentena si requiere curaciones.'
            }
            InputProps={{
              disableUnderline: true,
              sx: {
                borderRadius: '8px',
                bgcolor: isDark ? 'background.default' : '#f8fafc',
                '&:hover': { bgcolor: isDark ? 'action.hover' : '#f1f5f9' },
              },
            }}
          >
            {batches.map((batch) => (
              <MenuItem key={batch.id} value={batch.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                  <span>{batch.name}</span>
                  {batch.id === defaultDonorBatch?.id && (
                    <Chip label="Origen Original" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      {/* Sección 2: Fecha Efectiva del Reemplazo */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Fecha y Hora de la Sustitución *
        </Typography>
        <TextField
          type="datetime-local"
          fullWidth
          variant="filled"
          value={replacementDate}
          onChange={(e) => onReplacementDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            disableUnderline: true,
            sx: {
              borderRadius: '8px',
              bgcolor: isDark ? 'background.default' : '#f8fafc',
              '&:hover': { bgcolor: isDark ? 'action.hover' : '#f1f5f9' },
            },
          }}
        />
      </Box>

      {/* Sección 3: Observaciones y Diagnóstico Clínico */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Observaciones Clínicas y Notas de Campo
        </Typography>
        <TextField
          multiline
          rows={3}
          fullWidth
          variant="filled"
          placeholder="Ej: Claudicación en miembro posterior izquierdo por posible úlcera podal en potrero 3. Derivado para pediluvio y tratamiento..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          InputProps={{
            disableUnderline: true,
            sx: {
              borderRadius: '8px',
              bgcolor: isDark ? 'background.default' : '#f8fafc',
              '&:hover': { bgcolor: isDark ? 'action.hover' : '#f1f5f9' },
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default ReplacementDestinationStep;

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Paper,
  Chip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface StartBatchParametersStepProps {
  batchName: string;
  serviceBatchName: string;
  setServiceBatchName: (val: string) => void;
  plannedStartDate: string;
  setPlannedStartDate: (val: string) => void;
  plannedEndDate: string;
  setPlannedEndDate: (val: string) => void;
  serviceType: 'single' | 'multi' | 'rotation';
  setServiceType: (val: 'single' | 'multi' | 'rotation') => void;
  observations: string;
  setObservations: (val: string) => void;
  femaleCount: number;
  maleCount: number;
}

export const StartBatchParametersStep: React.FC<StartBatchParametersStepProps> = ({
  batchName,
  serviceBatchName,
  setServiceBatchName,
  plannedStartDate,
  setPlannedStartDate,
  plannedEndDate,
  setPlannedEndDate,
  serviceType,
  setServiceType,
  observations,
  setObservations,
  femaleCount,
  maleCount,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalHeadCount = femaleCount + maleCount;
  const ratio = femaleCount > 0 ? ((maleCount / femaleCount) * 100).toFixed(1) : '0';

  return (
    <Stack spacing={3}>
      {/* Resumen Aritmético Poblacional (schema_db_entore.md Sec. 2) */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'background.default' : '#f8fafc',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
          Conformación Aritmética del Nuevo Lote de Servicio
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Lote Base (Origen)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {batchName}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Vientres Aptos
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {femaleCount} cabezas
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Toros Incorporados
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
              {maleCount} toros ({ratio}%)
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Dotación Total
            </Typography>
            <Chip
              size="small"
              color="primary"
              label={`${totalHeadCount} Cabezas`}
              sx={{ fontWeight: 800 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Formulario de Configuración del Entore */}
      <Stack spacing={2}>
        <TextField
          label="Nombre del Lote de Servicio a Generar"
          fullWidth
          value={serviceBatchName}
          onChange={(e) => setServiceBatchName(e.target.value)}
          variant="filled"
          helperText="El lote base de origen permanece intacto en inventario; este lote agrupará la campaña durante el entore."
          InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Modalidad de Servicio"
            fullWidth
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as any)}
            variant="filled"
            InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
          >
            <MenuItem value="multi">Servicio Colectivo / Multi-Toro (Tradicional)</MenuItem>
            <MenuItem value="single">Servicio Individual (Un Solo Reproductor)</MenuItem>
            <MenuItem value="rotation">Servicio en Rotación Periódica</MenuItem>
          </TextField>

          <TextField
            label="Fecha de Inicio de Entore"
            type="date"
            fullWidth
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
            variant="filled"
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
          />

          <TextField
            label="Fecha Estimada de Retiro (Fin)"
            type="date"
            fullWidth
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
            variant="filled"
            helperText="Recomendado: 90 días (entore estacionado)"
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
          />
        </Stack>

        <TextField
          label="Observaciones y Notas de Manejo de Potrero"
          fullWidth
          multiline
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          variant="filled"
          placeholder="Ej: Potrero bajo con buena aguada; toros introducidos simultáneamente el primer día."
          InputProps={{ sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
        />
      </Stack>
    </Stack>
  );
};

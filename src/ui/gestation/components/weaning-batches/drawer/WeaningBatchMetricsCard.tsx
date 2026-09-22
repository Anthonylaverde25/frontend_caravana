import React from 'react';
import { Paper, Box, Typography, Stack, Chip, Divider } from '@mui/material';
import { Batch } from '@/core/batches/domain/entities/Batch';

interface WeaningBatchMetricsCardProps {
  batch: Batch | null;
  calvesCount: number;
  malesCount: number;
  femalesCount: number;
}

export const WeaningBatchMetricsCard: React.FC<WeaningBatchMetricsCardProps> = ({
  batch,
  calvesCount,
  malesCount,
  femalesCount,
}) => {
  const currentWeight = batch?.current_weight ?? batch?.weight;
  const knowsToEat = batch?.knows_to_eat;
  const ageInMonths = batch?.age_in_months;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: '8px',
        bgcolor: 'background.paper',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          mb: 1.5,
        }}
      >
        Métricas Zootécnicas del Lote
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
        }}
      >
        {/* Cabezas */}
        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            Total Terneros
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.25 }}>
            {calvesCount} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>cab</span>
          </Typography>
        </Box>

        {/* Desglose Sexos */}
        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            Distribución Sexos
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.25, fontSize: '0.95rem' }}>
            <span style={{ color: '#2563eb' }}>♂ {malesCount}</span> / <span style={{ color: '#db2777' }}>♀ {femalesCount}</span>
          </Typography>
        </Box>

        {/* Peso Medio */}
        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            Peso Promedio
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.25, color: '#107e3e' }}>
            {currentWeight != null && currentWeight > 0 ? `${currentWeight.toFixed(1)} kg` : 'Sin pesaje'}
          </Typography>
        </Box>

        {/* Edad Estimada */}
        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            Edad Promedio
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.25 }}>
            {ageInMonths ? `${ageInMonths} meses` : '6-8 meses'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Acostumbramiento a batea:
        </Typography>
        <Chip
          label={knowsToEat ? 'Conoce Comer (Batea/Ración)' : 'Sin Acostumbramiento'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            borderRadius: '4px',
            bgcolor: knowsToEat ? 'rgba(16, 126, 62, 0.12)' : 'action.hover',
            color: knowsToEat ? '#107e3e' : 'text.secondary',
          }}
        />
      </Stack>
    </Paper>
  );
};

export default WeaningBatchMetricsCard;

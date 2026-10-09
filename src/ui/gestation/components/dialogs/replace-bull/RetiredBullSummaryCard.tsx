import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface RetiredBullSummaryCardProps {
  bull: Caravan;
  originalDonorBatchName?: string | null;
}

export const RetiredBullSummaryCard: React.FC<RetiredBullSummaryCardProps> = ({
  bull,
  originalDonorBatchName,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '8px',
        border: 1,
        borderColor: 'warning.light',
        bgcolor: isDark ? 'rgba(237, 108, 2, 0.08)' : '#fff8e1',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
              Reproductor a Sustituir (Saliente)
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'text.primary' }}>
              #{bull.identification}
            </Typography>
          </Box>
        </Stack>
        <Chip
          label="En Servicio Activo"
          size="small"
          color="warning"
          variant="filled"
          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
          gap: 1.5,
          pt: 1,
          borderTop: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Raza / Categoría
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {bull.breed || 'Angus'} • {bull.category_name || bull.category || 'Toro'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Peso Vivo Registrado
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {bull.current_weight ? `${bull.current_weight} kg` : '—'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Procedencia Original
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {originalDonorBatchName || 'Torada en Descanso'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RetiredBullSummaryCard;

import React from 'react';
import { Paper, Stack, Typography, Box, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export const AnnualCyclePhysiologyCard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: '8px',
        bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
        borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#bbf7d0',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <FuseSvgIcon size={22} sx={{ color: isDark ? '#34d399' : '#15803d', mt: 0.25 }}>
          heroicons-outline:clock
        </FuseSvgIcon>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#34d399' : '#15803d', mb: 0.75 }}>
            2. El Fundamento Biológico: Ciclo de 365 Días (1 Ternero / Vaca / Año)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55, mb: 1 }}>
            El objetivo de un rodeo de cría es lograr 1 ternero por vaca al año. La fisiología bovina impone una restricción matemática estricta:
          </Typography>
          <Box
            sx={{
              p: 1.25,
              borderRadius: '6px',
              bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)',
              border: '1px dashed',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              fontWeight: 600,
              textAlign: 'center',
              color: isDark ? '#a7f3d0' : '#166534',
              mb: 1,
            }}
          >
            Gestación (~285 d) + Involución Uterina / Anestro (~30-50 d) = 315 a 335 días
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Esto deja un margen útil de concepción de <strong>apenas 30 a 50 días</strong> (2 a 3 ciclos estrales de 21 días). Delimitar la ventana a <strong>60-90 días (2 a 3 meses)</strong> impide que el intervalo entre partos supere los 365 días.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default AnnualCyclePhysiologyCard;

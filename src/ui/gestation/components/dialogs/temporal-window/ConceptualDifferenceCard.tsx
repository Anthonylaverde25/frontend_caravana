import React from 'react';
import { Paper, Stack, Typography, Box, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export const ConceptualDifferenceCard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: '8px',
        bgcolor: isDark ? 'rgba(2, 132, 199, 0.08)' : '#f0f9ff',
        borderColor: isDark ? 'rgba(2, 132, 199, 0.25)' : '#bae6fd',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <FuseSvgIcon size={22} sx={{ color: isDark ? '#38bdf8' : '#0284c7', mt: 0.25 }}>
          heroicons-outline:arrows-right-left
        </FuseSvgIcon>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#38bdf8' : '#0369a1', mb: 0.75 }}>
            1. Lote de Servicio (Físico) vs. Orden de Entore (Operativo)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55, mb: 1 }}>
            • <strong>Lote de Servicio (Batch SERVICE):</strong> Es la agrupación viva y física de vientres homogéneos y toros conviviendo en un potrero determinado. <em>Es una entidad transitoria/efímera</em>: se conforma para el servicio y se disuelve tras el tacto rectal.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55 }}>
            • <strong>Orden de Entore (ServiceOrder):</strong> Es el protocolo técnico y operativo (Monta Natural, IATF, IATF + Repaso) que define el calendario de manga, inseminación, veterinario a cargo y auditoría reproductiva.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ConceptualDifferenceCard;

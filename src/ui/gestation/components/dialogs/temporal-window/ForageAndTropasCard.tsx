import React from 'react';
import { Stack, Paper, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export const ForageAndTropasCard: React.FC = () => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 2,
          borderRadius: '8px',
          bgcolor: 'action.hover',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <FuseSvgIcon size={18} color="primary">heroicons-outline:sparkles</FuseSvgIcon>
          Curva Forrajera (Estacionamiento)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
          Hace coincidir el <strong>pico de máxima demanda nutricional</strong> (lactancia y servicio) con la mayor oferta de pasto en primavera/verano, evitando pérdidas de condición corporal.
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 2,
          borderRadius: '8px',
          bgcolor: 'action.hover',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <FuseSvgIcon size={18} color="primary">heroicons-outline:user-group</FuseSvgIcon>
          Tropas Homogéneas de Destete
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
          Una parición concentrada genera lotes de terneros parejos en peso y edad, facilitando el calendario de vacunación (Brucelosis) y maximizando el valor comercial de la invernada.
        </Typography>
      </Paper>
    </Stack>
  );
};

export default ForageAndTropasCard;

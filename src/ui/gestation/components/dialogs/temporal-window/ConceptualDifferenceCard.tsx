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
            1. Lote en Servicio (Físico) y Orden de Servicio (Operativa)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55, mb: 1 }}>
            • <strong>Lote en servicio:</strong> Es el lote de Cría de siempre, con sus vientres en su potrero. <em>No se crea otro lote</em>: el lote entra en servicio cuando los toros se suman a sus vientres, y conserva su historia campaña tras campaña.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55 }}>
            • <strong>Orden de servicio:</strong> Es lo que el sistema llama "lote de servicio": agrupa las políticas (monta natural, controlada o IA, relación toro/vaca, ventana), la ventana de exposición de cada vientre (quién entró o salió durante el servicio) y la trazabilidad hasta el tacto.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ConceptualDifferenceCard;

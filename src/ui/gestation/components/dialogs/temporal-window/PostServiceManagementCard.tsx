import React from 'react';
import { Paper, Stack, Typography, Box, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export const PostServiceManagementCard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: '8px',
        bgcolor: isDark ? 'rgba(234, 88, 12, 0.08)' : '#fff7ed',
        borderColor: isDark ? 'rgba(234, 88, 12, 0.25)' : '#fed7aa',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <FuseSvgIcon size={22} sx={{ color: isDark ? '#fb923c' : '#ea580c', mt: 0.25 }}>
          heroicons-outline:check-badge
        </FuseSvgIcon>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#fb923c' : '#c2410c', mb: 0.75 }}>
            3. Cierre del Servicio al Tacto y Salida de Toros
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55 }}>
            • <strong>Salida de Toros:</strong> Finalizada la ventana temporal (60-90 días), los toros <em>deben retirarse obligatoriamente</em> al lote de torada en descanso para evitar servicios anómalos o fuera de época.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.84rem', lineHeight: 1.55, mt: 0.5 }}>
            • <strong>Quiebre al Tacto (60 días post-cierre):</strong> La orden de servicio se cierra con el tacto: los <em>vientres preñados</em> se clasifican por cabeza, cuerpo o cola y las <em>vacías</em> se transfieren a otro lote (descarte o engorde para venta otoñal). El lote sigue existiendo para la próxima campaña.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PostServiceManagementCard;

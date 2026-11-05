import React from 'react';
import { Box, Typography, Stack, Paper, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceMethodType } from '../types';

interface Step1ServiceTypeProps {
  selectedType: ServiceMethodType | null;
  onSelect: (type: ServiceMethodType) => void;
}

export const Step1ServiceType: React.FC<Step1ServiceTypeProps> = ({ selectedType, onSelect }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>
          Modalidad de Servicio
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Elegí cómo se llevará a cabo el entore para adaptar los pasos siguientes del asistente.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Card 1: Tradicional */}
        <Paper
          elevation={0}
          onClick={() => onSelect('TRADITIONAL')}
          sx={{
            p: 3,
            borderRadius: '8px',
            border: 2,
            borderColor:
              selectedType === 'TRADITIONAL'
                ? 'primary.main'
                : isDark
                ? 'divider'
                : '#e2e8f0',
            bgcolor:
              selectedType === 'TRADITIONAL'
                ? isDark
                  ? alpha(theme.palette.primary.main, 0.12)
                  : alpha(theme.palette.primary.main, 0.04)
                : isDark
                ? 'background.paper'
                : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: 'primary.main',
              transform: 'translateY(-2px)',
              boxShadow: 2,
            },
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Box
                sx={{
                  w: 44,
                  h: 44,
                  p: 1.25,
                  borderRadius: '8px',
                  bgcolor: selectedType === 'TRADITIONAL' ? 'primary.main' : isDark ? 'action.hover' : '#f1f5f9',
                  color: selectedType === 'TRADITIONAL' ? '#ffffff' : 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FuseSvgIcon size={24}>heroicons-outline:fire</FuseSvgIcon>
              </Box>

              <Box
                sx={{
                  w: 22,
                  h: 22,
                  borderRadius: '50%',
                  border: 2,
                  borderColor: selectedType === 'TRADITIONAL' ? 'primary.main' : 'text.disabled',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: selectedType === 'TRADITIONAL' ? 'primary.main' : 'transparent',
                }}
              >
                {selectedType === 'TRADITIONAL' && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffffff' }} />
                )}
              </Box>
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
              Servicio Tradicional
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block', mb: 1 }}>
              Monta Natural a Campo
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.4 }}>
              Asignación de toros reproductores con cálculo de ratio toro/vaca, control de descansos y convivencia en potrero.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} mt={3} alignItems="center">
            <FuseSvgIcon size={16} sx={{ color: 'success.main' }}>heroicons-solid:check-circle</FuseSvgIcon>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Toros machos + vientres en potrero
            </Typography>
          </Stack>
        </Paper>

        {/* Card 2: Inseminación Artificial */}
        <Paper
          elevation={0}
          onClick={() => onSelect('AI')}
          sx={{
            p: 3,
            borderRadius: '8px',
            border: 2,
            borderColor:
              selectedType === 'AI'
                ? 'primary.main'
                : isDark
                ? 'divider'
                : '#e2e8f0',
            bgcolor:
              selectedType === 'AI'
                ? isDark
                  ? alpha(theme.palette.primary.main, 0.12)
                  : alpha(theme.palette.primary.main, 0.04)
                : isDark
                ? 'background.paper'
                : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: 'primary.main',
              transform: 'translateY(-2px)',
              boxShadow: 2,
            },
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Box
                sx={{
                  w: 44,
                  h: 44,
                  p: 1.25,
                  borderRadius: '8px',
                  bgcolor: selectedType === 'AI' ? 'primary.main' : isDark ? 'action.hover' : '#f1f5f9',
                  color: selectedType === 'AI' ? '#ffffff' : 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FuseSvgIcon size={24}>heroicons-outline:sparkles</FuseSvgIcon>
              </Box>

              <Box
                sx={{
                  w: 22,
                  h: 22,
                  borderRadius: '50%',
                  border: 2,
                  borderColor: selectedType === 'AI' ? 'primary.main' : 'text.disabled',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: selectedType === 'AI' ? 'primary.main' : 'transparent',
                }}
              >
                {selectedType === 'AI' && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffffff' }} />
                )}
              </Box>
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
              Inseminación Artificial
            </Typography>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, display: 'block', mb: 1 }}>
              IA / IATF con Pajuelas de Semen
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.4 }}>
              Servicio programado por pajuelas del inventario, técnicos inseminadores y protocolos de sincronización a tiempo fijo.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} mt={3} alignItems="center">
            <FuseSvgIcon size={16} sx={{ color: 'success.main' }}>heroicons-solid:check-circle</FuseSvgIcon>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Pajuelas de semen + manga/protocolo
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
};

export default Step1ServiceType;

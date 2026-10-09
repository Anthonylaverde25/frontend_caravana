import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Radio,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface ReplacementReasonOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const REPLACEMENT_REASONS: ReplacementReasonOption[] = [
  {
    value: 'LAMENESS_FOOT',
    label: 'Manquera / Afección Podal',
    description: 'Claudicación, pezuñas, gabarro o artritis que impide el desplazamiento y la monta.',
    icon: 'heroicons-outline:exclamation-circle',
    color: '#d97706',
  },
  {
    value: 'PENIS_INJURY',
    label: 'Lesión Peneana / Prepucial',
    description: 'Acrobustitis, hematoma o traumatismo en cópula que imposibilita la cópula efectiva.',
    icon: 'heroicons-outline:shield-exclamation',
    color: '#dc2626',
  },
  {
    value: 'LOW_LIBIDO_RINCONERO',
    label: 'Toro Rinconero / Baja Libido',
    description: 'Apatía sexual: ejemplar aislado en rincones/aguadas sin buscar ni seguir hembras en celo.',
    icon: 'heroicons-outline:eye-slash',
    color: '#475569',
  },
  {
    value: 'AGGRESSION',
    label: 'Agresividad Extrema / Peleas',
    description: 'Dominancia violenta con peleas continuas, riesgo de lesiones a otros toros o rotura de alambrados.',
    icon: 'heroicons-outline:bolt',
    color: '#e11d48',
  },
  {
    value: 'DEATH',
    label: 'Muerte en Potrero',
    description: 'Baja física del reproductor en el campo durante la temporada activa.',
    icon: 'heroicons-outline:no-symbol',
    color: '#0f172a',
  },
  {
    value: 'OTHER',
    label: 'Otra Causa Veterinaria',
    description: 'Criterio clínico particular especificado en las notas de campo.',
    icon: 'heroicons-outline:clipboard-document-list',
    color: '#2563eb',
  },
];

interface ReplacementReasonSelectorProps {
  selectedReason: string;
  onSelectReason: (reason: string) => void;
}

export const ReplacementReasonSelector: React.FC<ReplacementReasonSelectorProps> = ({
  selectedReason,
  onSelectReason,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Motivo Clínico / Diagnóstico de la Sustitución *
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        {REPLACEMENT_REASONS.map((option) => {
          const isSelected = selectedReason === option.value;

          return (
            <Paper
              key={option.value}
              elevation={0}
              onClick={() => onSelectReason(option.value)}
              sx={{
                p: 1.5,
                borderRadius: '8px',
                border: 2,
                borderColor: isSelected ? 'primary.main' : isDark ? 'divider' : '#e2e8f0',
                bgcolor: isSelected
                  ? isDark
                    ? 'rgba(10, 110, 209, 0.12)'
                    : '#f0f7ff'
                  : isDark
                  ? 'background.paper'
                  : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                '&:hover': {
                  borderColor: isSelected ? 'primary.main' : 'primary.light',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                },
              }}
            >
              <Radio
                checked={isSelected}
                onChange={() => onSelectReason(option.value)}
                value={option.value}
                size="small"
                sx={{ p: 0, mt: 0.25 }}
              />

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: option.color,
                    }}
                  >
                    <FuseSvgIcon size={18}>{option.icon}</FuseSvgIcon>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: isSelected ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {option.label}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
                  {option.description}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Stack>
  );
};

export default ReplacementReasonSelector;

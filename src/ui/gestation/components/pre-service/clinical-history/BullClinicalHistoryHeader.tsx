import React from 'react';
import {
  Paper,
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ClinicalCaravanInfo } from '@/core/pre-service/domain/BullClinicalHistory';

interface BullClinicalHistoryHeaderProps {
  caravan: ClinicalCaravanInfo;
  computedStatus: 'APT' | 'UNFIT' | 'IN_TREATMENT' | 'PENDING_EVALUATION';
  onEvaluateInManga?: () => void;
}

export const BullClinicalHistoryHeader: React.FC<BullClinicalHistoryHeaderProps> = ({
  caravan,
  computedStatus,
  onEvaluateInManga,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getStatusBadge = () => {
    switch (computedStatus) {
      case 'APT':
        return {
          label: 'APTO REPRODUCTOR',
          bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7',
          color: isDark ? '#34d399' : '#15803d',
          border: '1px solid #86efac',
          icon: 'heroicons-outline:check-badge',
        };
      case 'IN_TREATMENT':
        return {
          label: 'EN TRATAMIENTO CLÍNICO',
          bgcolor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
          color: isDark ? '#fbbf24' : '#b45309',
          border: '1px solid #fde047',
          icon: 'heroicons-outline:exclamation-triangle',
        };
      case 'UNFIT':
        return {
          label: 'RECHAZO / NO APTO',
          bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
          color: isDark ? '#f87171' : '#b91c1c',
          border: '1px solid #fca5a5',
          icon: 'heroicons-outline:x-circle',
        };
      case 'PENDING_EVALUATION':
      default:
        return {
          label: 'PENDIENTE DE EVALUACIÓN / LAB',
          bgcolor: isDark ? 'rgba(148, 163, 184, 0.2)' : '#f1f5f9',
          color: isDark ? '#cbd5e1' : '#475569',
          border: '1px solid #cbd5e1',
          icon: 'heroicons-outline:clock',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2.5}
      >
        {/* Left: Avatar / Tag Icon + Identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(10, 110, 209, 0.15)' : '#eff6ff',
              color: isDark ? '#60a5fa' : '#0a6ed1',
              border: '1.5px solid',
              borderColor: isDark ? 'rgba(10, 110, 209, 0.3)' : '#bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FuseSvgIcon size={30}>heroicons-outline:identification</FuseSvgIcon>
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {caravan.identification}
              </Typography>

              <Chip
                label={badge.label}
                icon={<FuseSvgIcon size={16}>{badge.icon}</FuseSvgIcon>}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 26,
                  bgcolor: badge.bgcolor,
                  color: badge.color,
                  border: badge.border,
                  '& .MuiChip-icon': { color: badge.color },
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 0.5,
                fontSize: '0.82rem',
              }}
            >
              {caravan.category} • {caravan.breed} {caravan.color} • {caravan.batch_name} ({caravan.farm_name})
              {caravan.current_weight ? ` • Peso: ${Number(caravan.current_weight).toFixed(0)} kg` : ''}
              {caravan.teeth ? ` • Dentición: ${caravan.teeth} dientes` : ''}
            </Typography>
          </Box>
        </Box>

        {/* Right: Quick Action Buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
          {onEvaluateInManga && (
            <Button
              variant="contained"
              color="primary"
              onClick={onEvaluateInManga}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>}
              sx={{
                width: { xs: '100%', md: 'auto' },
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: '6px',
                height: 38,
                bgcolor: '#0a6ed1',
                '&:hover': { bgcolor: '#0854a0' },
              }}
            >
              Evaluar en Manga
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default BullClinicalHistoryHeader;

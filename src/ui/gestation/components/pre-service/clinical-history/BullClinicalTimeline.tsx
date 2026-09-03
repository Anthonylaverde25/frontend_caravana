import React from 'react';
import {
  Paper,
  Box,
  Stack,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ClinicalTimelineItem } from '@/core/pre-service/domain/BullClinicalHistory';

interface BullClinicalTimelineProps {
  timeline: ClinicalTimelineItem[];
}

export const BullClinicalTimeline: React.FC<BullClinicalTimelineProps> = ({ timeline }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!timeline || timeline.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No hay eventos clínicos registrados en el historial de este animal.
        </Typography>
      </Paper>
    );
  }

  const getEventBadge = (item: ClinicalTimelineItem) => {
    switch (item.type) {
      case 'ANDROLOGICAL_EXAM':
        return {
          icon: 'heroicons-outline:pencil-square',
          color: '#0f766e',
          bgcolor: isDark ? 'rgba(15, 118, 110, 0.2)' : '#ccfbf1',
          borderColor: '#99f6e4',
          label: 'Manga / Andrología',
        };
      case 'LAB_SAMPLE':
        return {
          icon: 'heroicons-outline:beaker',
          color: '#b45309',
          bgcolor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#fef3c7',
          borderColor: '#fde047',
          label: 'Muestreo Lab',
        };
      case 'VETERINARY_DIAGNOSIS':
      default:
        return {
          icon: 'heroicons-outline:shield-exclamation',
          color: '#7c3aed',
          bgcolor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#ede9fe',
          borderColor: '#ddd6fe',
          label: 'Diagnóstico Clínico',
        };
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FuseSvgIcon size={20} color="action">heroicons-outline:clock</FuseSvgIcon>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
          Línea de Tiempo Clínica y Sanitaria
        </Typography>
      </Box>

      <Stack spacing={0} sx={{ position: 'relative', pl: { xs: 2, sm: 3 } }}>
        {/* Vertical timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 15, sm: 23 },
            top: 16,
            bottom: 16,
            width: 2,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
          }}
        />

        {timeline.map((item, idx) => {
          const badge = getEventBadge(item);
          const isLast = idx === timeline.length - 1;

          return (
            <Box
              key={item.id}
              sx={{
                position: 'relative',
                pb: isLast ? 0 : 3,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              {/* Event Circle Dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: -19, sm: -19 },
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: isDark ? '#1e293b' : '#ffffff',
                  border: `2px solid ${badge.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: badge.color,
                  zIndex: 2,
                }}
              >
                <FuseSvgIcon size={16}>{badge.icon}</FuseSvgIcon>
              </Box>

              {/* Event Content Card */}
              <Paper
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  ml: 2.5,
                  p: 2,
                  borderRadius: '8px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      size="small"
                      label={badge.label}
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        height: 20,
                        bgcolor: badge.bgcolor,
                        color: badge.color,
                        border: `1px solid ${badge.borderColor}`,
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                      {item.title}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {item.date}
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ mt: 1, color: isDark ? '#cbd5e1' : '#475569', fontSize: '0.82rem' }}>
                  {item.description}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default BullClinicalTimeline;

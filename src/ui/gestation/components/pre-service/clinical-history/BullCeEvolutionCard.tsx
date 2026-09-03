import React from 'react';
import {
  Paper,
  Box,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ClinicalMetrics } from '@/core/pre-service/domain/BullClinicalHistory';

interface BullCeEvolutionCardProps {
  metrics: ClinicalMetrics;
}

export const BullCeEvolutionCard: React.FC<BullCeEvolutionCardProps> = ({ metrics }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isCompliant = metrics.is_ce_compliant;
  const delta = metrics.ce_delta_cm;
  const isPositiveDelta = delta >= 0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {/* 1. Scrotal Circumference Metric */}
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Circunferencia Escrotal (CE)
            </Typography>
            <Box sx={{ color: isCompliant ? '#16a34a' : '#dc2626' }}>
              <FuseSvgIcon size={20}>
                {isCompliant ? 'heroicons-outline:check-circle' : 'heroicons-outline:exclamation-circle'}
              </FuseSvgIcon>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
            {metrics.latest_ce_cm !== null ? `${metrics.latest_ce_cm.toFixed(1)} cm` : 'Sin medir'}
          </Typography>

          <Typography variant="caption" sx={{ color: isCompliant ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
            {isCompliant ? '✓ Cumple umbral Carrillo (≥ 28.0 cm)' : '⚠️ Bajo umbral mínimo zootécnico'}
          </Typography>
        </Stack>
      </Paper>

      {/* 2. Development Delta Metric */}
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Evolución Testicular
            </Typography>
            <Box sx={{ color: isPositiveDelta ? '#0284c7' : '#ea580c' }}>
              <FuseSvgIcon size={20}>
                {isPositiveDelta ? 'heroicons-outline:arrow-trending-up' : 'heroicons-outline:arrow-trending-down'}
              </FuseSvgIcon>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: isPositiveDelta ? '#0369a1' : '#c2410c' }}>
            {isPositiveDelta ? `+${delta.toFixed(1)} cm` : `${delta.toFixed(1)} cm`}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {metrics.oldest_ce_cm !== null ? `Registro inicial: ${metrics.oldest_ce_cm.toFixed(1)} cm` : 'Primer pesaje'}
          </Typography>
        </Stack>
      </Paper>

      {/* 3. Manga Evaluations Count */}
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pasadas por Manga
            </Typography>
            <Box sx={{ color: '#0f766e' }}>
              <FuseSvgIcon size={20}>heroicons-outline:queue-list</FuseSvgIcon>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
            {metrics.evaluations_count}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Evaluaciones andrológicas registradas
          </Typography>
        </Stack>
      </Paper>

      {/* 4. Biological Samples & Health Status */}
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Muestreos &amp; Sanidad
            </Typography>
            <Box sx={{ color: metrics.active_diagnoses_count > 0 ? '#dc2626' : '#16a34a' }}>
              <FuseSvgIcon size={20}>heroicons-outline:beaker</FuseSvgIcon>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
            {metrics.lab_samples_count}
          </Typography>

          <Typography variant="caption" sx={{ color: metrics.active_diagnoses_count > 0 ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
            {metrics.active_diagnoses_count > 0
              ? `${metrics.active_diagnoses_count} afección activa`
              : '✓ Sin afecciones activas'}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BullCeEvolutionCard;

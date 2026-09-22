import React from 'react';
import { Paper, Stack, Box, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface WeaningBatchKPIs {
  totalBatches: number;
  totalActive: number;
  totalCalves: number;
  totalMales: number;
  totalFemales: number;
  avgWeight: number;
}

interface WeaningBatchSummaryCardsProps {
  kpis: WeaningBatchKPIs;
  isDark: boolean;
}

export const WeaningBatchSummaryCards: React.FC<WeaningBatchSummaryCardsProps> = ({
  kpis,
  isDark,
}) => {
  const purple = isDark ? '#a78bfa' : '#8b5cf6';
  const blue = isDark ? '#60a5fa' : '#0a6ed1';
  const green = isDark ? '#34d399' : '#107e3e';
  const orange = isDark ? '#fb923c' : '#e6600d';

  const isWeightOptimal = kpis.avgWeight >= 170;
  const isWeightAdequate = kpis.avgWeight >= 150;

  const cards = [
    {
      id: 'active_batches',
      label: 'Lotes de Destete Activos',
      value: String(kpis.totalActive),
      icon: 'heroicons-outline:clock',
      accent: purple,
      valueColor: 'text.primary',
      footer: `${kpis.totalBatches} lotes totales registrados`,
      footerColor: 'text.secondary',
    },
    {
      id: 'total_calves',
      label: 'Terneros en Desmadre',
      value: String(kpis.totalCalves),
      icon: 'heroicons-outline:user-group',
      accent: blue,
      valueColor: 'text.primary',
      footer: 'Cabezas totales desmadradas',
      footerColor: 'text.secondary',
    },
    {
      id: 'sex_distribution',
      label: 'Distribución Sexos',
      value: `${kpis.totalMales} ♂ / ${kpis.totalFemales} ♀`,
      icon: 'heroicons-outline:scale',
      accent: purple,
      valueColor: 'text.primary',
      footer: `${kpis.totalMales} machos y ${kpis.totalFemales} hembras`,
      footerColor: 'text.secondary',
    },
    {
      id: 'avg_weight',
      label: 'Peso Promedio Destete',
      value: kpis.avgWeight > 0 ? `${kpis.avgWeight.toFixed(1)} kg` : 'Sin datos',
      icon: 'heroicons-outline:chart-bar',
      accent: isWeightOptimal ? green : isWeightAdequate ? blue : orange,
      valueColor: isWeightOptimal
        ? (isDark ? '#34d399' : '#107e3e')
        : isWeightAdequate
        ? (isDark ? '#60a5fa' : '#0a6ed1')
        : (isDark ? '#fb923c' : '#e6600d'),
      footer: isWeightOptimal
        ? 'Rango óptimo (≥ 170 kg)'
        : isWeightAdequate
        ? 'Rango adecuado (150 - 169 kg)'
        : kpis.avgWeight > 0
        ? 'Peso bajo (< 150 kg)'
        : 'Pendiente de pesaje',
      footerColor: isWeightOptimal
        ? (isDark ? '#34d399' : '#107e3e')
        : isWeightAdequate
        ? (isDark ? '#60a5fa' : '#0a6ed1')
        : (isDark ? '#fb923c' : '#e6600d'),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.id}
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.68rem',
                }}
              >
                {card.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: card.valueColor,
                  mt: 0.5,
                  letterSpacing: '-0.02em',
                }}
              >
                {card.value}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: '6px',
                bgcolor: alpha(card.accent, isDark ? 0.14 : 0.1),
                color: card.accent,
                display: 'flex',
              }}
            >
              <FuseSvgIcon size={20}>{card.icon}</FuseSvgIcon>
            </Box>
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: card.footerColor,
              fontWeight: 500,
              display: 'block',
              mt: 1,
            }}
          >
            {card.footer}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default WeaningBatchSummaryCards;

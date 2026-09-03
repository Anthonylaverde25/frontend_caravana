import React from 'react';
import { Paper, Stack, Box, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface ServiceBatchKPIs {
  totalBatches: number;
  totalActive: number;
  totalFemales: number;
  totalMales: number;
  avgRatio: number;
  criticalRatioCount: number;
}

interface ServiceBatchSummaryCardsProps {
  kpis: ServiceBatchKPIs;
  isDark: boolean;
}

export const ServiceBatchSummaryCards: React.FC<ServiceBatchSummaryCardsProps> = ({
  kpis,
  isDark,
}) => {
  const active = isDark ? '#60a5fa' : '#0a6ed1';
  const positive = isDark ? '#34d399' : '#107e3e';
  const warning = isDark ? '#fb923c' : '#e6600d';
  const pink = isDark ? '#f472b6' : '#db2777';

  const isRatioOptimal = kpis.avgRatio >= 2.0;

  const cards = [
    {
      id: 'active_batches',
      label: 'Lotes de Servicio Activos',
      value: String(kpis.totalActive),
      icon: 'heroicons-outline:heart',
      accent: pink,
      valueColor: 'text.primary',
      footer: `${kpis.totalBatches} lotes totales registrados`,
      footerColor: 'text.secondary',
    },
    {
      id: 'females',
      label: 'Vientres en Entore',
      value: String(kpis.totalFemales),
      icon: 'heroicons-outline:user-group',
      accent: active,
      valueColor: 'text.primary',
      footer: 'Hembras asignadas en servicio',
      footerColor: 'text.secondary',
    },
    {
      id: 'males',
      label: 'Toros en Servicio',
      value: String(kpis.totalMales),
      icon: 'heroicons-outline:bolt',
      accent: warning,
      valueColor: 'text.primary',
      footer: 'Reproductores activos en torada',
      footerColor: 'text.secondary',
    },
    {
      id: 'ratio',
      label: 'Ratio Torada Promedio',
      value: `${kpis.avgRatio}%`,
      icon: 'heroicons-outline:scale',
      accent: isRatioOptimal ? positive : warning,
      valueColor: isRatioOptimal ? (isDark ? '#34d399' : '#107e3e') : (isDark ? '#fb923c' : '#e6600d'),
      footer: isRatioOptimal ? 'Umbral óptimo (2.0% - 3.0%)' : 'Torada insuficiente (<2.0%)',
      footerColor: isRatioOptimal ? (isDark ? '#34d399' : '#107e3e') : (isDark ? '#fb923c' : '#e6600d'),
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
                variant="h4"
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

export default ServiceBatchSummaryCards;

import React from 'react';
import { Paper, Stack, Box, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';

export interface DashboardKPIs {
  quarantineCount: number;
  quarantineCritical: number;
  serviceBatchesCount: number;
  serviceFemales: number;
  serviceMales: number;
  serviceRatio: number;
  consumptionCount: number;
  consumptionKg: number;
  deathCount: number;
  deathRate: number;
}

interface DashboardSummaryCardsProps {
  kpis: DashboardKPIs;
}

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({ kpis }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const cyan = isDark ? '#38bdf8' : '#0284c7';
  const pink = isDark ? '#f472b6' : '#db2777';
  const green = isDark ? '#34d399' : '#107e3e';
  const red = isDark ? '#f87171' : '#dc2626';

  const cards = [
    {
      id: 'quarantine',
      label: 'Cuarentena & Sanidad',
      value: String(kpis.quarantineCount),
      icon: 'heroicons-outline:shield-exclamation',
      accent: cyan,
      valueColor: 'text.primary',
      footer: `${kpis.quarantineCritical} caso crítico en aislamiento`,
      footerColor: kpis.quarantineCritical > 0 ? (isDark ? '#fb923c' : '#ea580c') : 'text.secondary',
      onClick: undefined,
    },
    {
      id: 'service_batches',
      label: 'Entore en Servicio (Cría)',
      value: `${kpis.serviceBatchesCount} Lotes`,
      icon: 'heroicons-outline:heart',
      accent: pink,
      valueColor: isDark ? '#f472b6' : '#db2777',
      footer: `${kpis.serviceFemales} ♀ • ${kpis.serviceMales} ♂ (Ratio ${kpis.serviceRatio}% Óptimo)`,
      footerColor: isDark ? '#34d399' : '#15803d',
      onClick: () => navigate('/gestation/service-batches'),
      isClickable: true,
    },
    {
      id: 'consumption',
      label: 'Consumo Interno (Faena)',
      value: `${kpis.consumptionCount} Animales`,
      icon: 'heroicons-outline:shopping-bag',
      accent: green,
      valueColor: 'text.primary',
      footer: `${kpis.consumptionKg.toLocaleString()} kg listos para personal`,
      footerColor: 'text.secondary',
      onClick: undefined,
    },
    {
      id: 'deaths',
      label: 'Bajas & Mortandad',
      value: `${kpis.deathCount} Bajas`,
      icon: 'heroicons-outline:no-symbol',
      accent: red,
      valueColor: 'text.primary',
      footer: `Tasa mensual ${kpis.deathRate}% (Rango normal)`,
      footerColor: 'text.secondary',
      onClick: undefined,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.id}
          elevation={0}
          onClick={card.onClick}
          sx={{
            p: 2.25,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: card.isClickable ? 'pointer' : 'default',
            '&:hover': card.isClickable
              ? {
                  borderColor: isDark ? 'rgba(244, 114, 182, 0.4)' : '#fbcfe8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }
              : undefined,
            transition: 'all 0.15s ease',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.68rem',
                  display: 'block',
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
                  fontSize: { xs: '1.4rem', sm: '1.65rem' },
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
                flexShrink: 0,
              }}
            >
              <FuseSvgIcon size={20}>{card.icon}</FuseSvgIcon>
            </Box>
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: card.footerColor,
              fontWeight: 600,
              display: 'block',
              mt: 1,
              fontSize: '0.74rem',
            }}
          >
            {card.footer}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default DashboardSummaryCards;

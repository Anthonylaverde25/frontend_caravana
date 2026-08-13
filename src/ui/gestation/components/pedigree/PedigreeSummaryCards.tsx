import { Paper, Stack, Box, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PedigreeMetrics } from './usePedigreeData';

interface PedigreeSummaryCardsProps {
  metrics: PedigreeMetrics;
  isDark: boolean;
}

export default function PedigreeSummaryCards({ metrics, isDark }: PedigreeSummaryCardsProps) {
  const active = isDark ? '#60a5fa' : '#0a6ed1';
  const positive = isDark ? '#34d399' : '#107e3e';
  const warning = isDark ? '#fb923c' : '#e6600d';
  const danger = isDark ? '#f87171' : '#bb0000';
  const neutral = isDark ? '#94a3b8' : '#64748b';

  const avgAlert = Number(metrics.avgFx) > 6.25;
  const hasAlerts = metrics.alertCount > 0;

  const cards = [
    {
      id: 'total',
      label: 'Rodeo Total',
      value: String(metrics.total),
      icon: 'heroicons-outline:squares-2x2',
      accent: active,
      valueColor: 'text.primary',
      footer: 'Población activa evaluada',
      footerColor: 'text.secondary',
    },
    {
      id: 'lineage',
      label: 'Registro Genealógico',
      value: String(metrics.withLineage),
      icon: 'heroicons-outline:document-text',
      accent: positive,
      valueColor: 'text.primary',
      footer: `${Math.round((metrics.withLineage / (metrics.total || 1)) * 100)}% del rodeo trazado`,
      footerColor: positive,
    },
    {
      id: 'avg',
      label: 'Consanguinidad Prom. (Fx)',
      value: `${metrics.avgFx}%`,
      icon: 'heroicons-outline:chart-bar',
      accent: avgAlert ? warning : active,
      valueColor: avgAlert ? warning : 'text.primary',
      footer: 'Umbral óptimo < 3.00%',
      footerColor: 'text.secondary',
    },
    {
      id: 'alert',
      label: 'Alertas Endogamia (>6.25%)',
      value: String(metrics.alertCount),
      icon: 'heroicons-outline:exclamation-triangle',
      accent: hasAlerts ? danger : neutral,
      valueColor: hasAlerts ? danger : 'text.primary',
      footer: hasAlerts ? 'Requiere rotación o aislamiento' : 'Sin alertas de consanguinidad',
      footerColor: hasAlerts ? danger : 'text.secondary',
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
                sx={{ fontWeight: 700, color: card.valueColor, mt: 0.5, letterSpacing: '-0.02em' }}
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
            sx={{ color: card.footerColor, fontWeight: 500, display: 'block', mt: 1 }}
          >
            {card.footer}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

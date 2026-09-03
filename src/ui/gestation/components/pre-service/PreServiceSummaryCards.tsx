import React from 'react';
import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullHealthEvaluation } from '@/core/pre-service/domain/BullHealthEvaluation';

interface PreServiceSummaryCardsProps {
  bulls: BullHealthEvaluation[];
}

export const PreServiceSummaryCards: React.FC<PreServiceSummaryCardsProps> = ({ bulls }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const total = bulls.length;
  const apt = bulls.filter((b) => b.status === 'APT').length;
  const inTreatment = bulls.filter((b) => b.status === 'IN_TREATMENT').length;
  const unfit = bulls.filter((b) => b.status === 'UNFIT').length;
  const pending = bulls.filter((b) => b.status === 'PENDING_EVALUATION').length;

  const aptPercentage = total > 0 ? Math.round((apt / total) * 100) : 0;

  const activeColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const warningColor = isDark ? '#fb923c' : '#e6600d';
  const errorColor = isDark ? '#f87171' : '#dc2626';
  const neutralColor = isDark ? '#94a3b8' : '#64748b';

  const cards = [
    {
      id: 'total_bulls',
      label: 'Plantel de Toros',
      value: String(total),
      subtitle: `${aptPercentage}% Aptitud General`,
      icon: 'heroicons-outline:user-group',
      accent: activeColor,
      footer: 'Toros reproductores en rodeo',
    },
    {
      id: 'apt_bulls',
      label: 'Aptos para Servicio',
      value: String(apt),
      subtitle: 'Habilitados para Entore',
      icon: 'heroicons-outline:check-circle',
      accent: successColor,
      footer: 'Cumplen biometría y sanidad',
    },
    {
      id: 'in_treatment',
      label: 'En Tratamiento',
      value: String(inTreatment),
      subtitle: 'Bloqueados transitoriamente',
      icon: 'heroicons-outline:exclamation-circle',
      accent: warningColor,
      footer: 'En recuperación clínica',
    },
    {
      id: 'unfit_bulls',
      label: 'Rechazo / Descarte',
      value: String(unfit),
      subtitle: 'No aptos reproductivos',
      icon: 'heroicons-outline:x-circle',
      accent: errorColor,
      footer: 'Defectos o patógenos venéreos',
    },
    {
      id: 'pending_eval',
      label: 'Pendientes Examen',
      value: String(pending),
      subtitle: 'Sin revisación en manga',
      icon: 'heroicons-outline:clock',
      accent: neutralColor,
      footer: 'Revisación andrológica requerida',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
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
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.06)',
            },
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
                  color: 'text.primary',
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
                borderRadius: '8px',
                bgcolor: alpha(card.accent, 0.12),
                color: card.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FuseSvgIcon size={22}>{card.icon}</FuseSvgIcon>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 2,
              pt: 1.25,
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: card.accent,
                display: 'block',
              }}
            >
              {card.subtitle}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                mt: 0.25,
                display: 'block',
              }}
            >
              {card.footer}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default PreServiceSummaryCards;

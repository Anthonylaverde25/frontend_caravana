import React from 'react';
import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DiagnosticProtocol } from '@/core/veterinary/domain/VeterinaryTypes';

interface DiagnosticProtocolsSummaryCardsProps {
  protocols: DiagnosticProtocol[];
}

export const DiagnosticProtocolsSummaryCards: React.FC<DiagnosticProtocolsSummaryCardsProps> = ({ protocols }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const total = protocols.length;
  const confirmed = protocols.filter((p) => p.status === 'CONFIRMED').length;
  const verified = protocols.filter(
    (p) => p.status === 'CONFIRMED' && p.verification_status === 'VERIFIED'
  ).length;
  const unverified = protocols.filter(
    (p) => p.status === 'CONFIRMED' && p.verification_status === 'UNVERIFIED'
  ).length;
  const positives = protocols.reduce((sum, p) => sum + (p.positive_findings_count || 0), 0);
  const totalSamples = protocols.reduce((sum, p) => sum + (p.samples_count || 0), 0);

  const pctConfirmed = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const activeColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const warningColor = isDark ? '#fb923c' : '#e6600d';
  const errorColor = isDark ? '#f87171' : '#dc2626';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';

  const cards = [
    {
      id: 'total_protocols',
      label: 'Total Protocolos',
      value: String(total),
      subtitle: `${pctConfirmed}% Confirmados / Vigentes`,
      icon: 'heroicons-outline:document-text',
      accent: activeColor,
      footer: 'Documentación sanitaria archivada',
    },
    {
      id: 'verified_protocols',
      label: 'Con Aval Profesional',
      value: String(verified),
      subtitle: 'Firma y MP Certificadas',
      icon: 'heroicons-outline:check-circle',
      accent: successColor,
      footer: 'Validación técnica por médico veterinario',
    },
    {
      id: 'unverified_protocols',
      label: 'Sin Aval Profesional',
      value: String(unverified),
      subtitle: 'Cargados por Productor',
      icon: 'heroicons-outline:exclamation-circle',
      accent: warningColor,
      footer: 'Pendientes de rúbrica profesional',
    },
    {
      id: 'positive_findings',
      label: 'Hallazgos Positivos',
      value: String(positives),
      subtitle: positives > 0 ? 'Alerta Sanitaria Activa' : 'Sin reactividad reportada',
      icon: 'heroicons-outline:shield-exclamation',
      accent: errorColor,
      footer: 'Bovinos reactivos o aislados',
    },
    {
      id: 'total_determinations',
      label: 'Determinaciones',
      value: String(totalSamples),
      subtitle: 'Muestras Procesadas',
      icon: 'heroicons-outline:beaker',
      accent: purpleColor,
      footer: 'Raspajes prepuciales y análisis',
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

export default DiagnosticProtocolsSummaryCards;

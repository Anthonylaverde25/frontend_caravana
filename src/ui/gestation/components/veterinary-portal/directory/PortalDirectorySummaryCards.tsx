import React from "react";
import { Paper, Stack, Box, Typography, alpha } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { PortalDirectoryRow } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  rows: PortalDirectoryRow[];
  isDark: boolean;
}

export const PortalDirectorySummaryCards: React.FC<Props> = ({ rows, isDark }) => {
  const active = isDark ? "#60a5fa" : "#0a6ed1";
  const positive = isDark ? "#34d399" : "#107e3e";
  const warning = isDark ? "#fb923c" : "#e6600d";
  const purple = isDark ? "#a78bfa" : "#7c3aed";
  const neutral = isDark ? "#94a3b8" : "#64748b";

  const totals = rows.reduce(
    (acc, row) => ({
      total: acc.total + 1,
      withAccount: acc.withAccount + (row.has_portal_account ? 1 : 0),
      activeTokens: acc.activeTokens + (row.active_token_count > 0 ? 1 : 0),
      pendingSignature: acc.pendingSignature + row.pending_signature_count,
      pendingReport: acc.pendingReport + row.pending_lab_report_count,
      unshippedSamples: acc.unshippedSamples + row.unshipped_samples_count,
    }),
    {
      total: 0,
      withAccount: 0,
      activeTokens: 0,
      pendingSignature: 0,
      pendingReport: 0,
      unshippedSamples: 0,
    },
  );

  const cards = [
    {
      id: "total",
      label: "Padrón de Profesionales",
      value: String(totals.total),
      icon: "heroicons-outline:users",
      accent: active,
      valueColor: "text.primary",
      footer: `${totals.withAccount} con cuenta · ${totals.activeTokens} con enlace activo`,
      footerColor: totals.withAccount > 0 ? positive : "text.secondary",
    },
    {
      id: "pending_signature",
      label: "Actas por Firmar",
      value: String(totals.pendingSignature),
      icon: "heroicons-outline:pencil-square",
      accent: totals.pendingSignature > 0 ? warning : neutral,
      valueColor: totals.pendingSignature > 0 ? warning : "text.primary",
      footer:
        totals.pendingSignature > 0
          ? "Requiere firma del médico veterinario"
          : "Al día sin firmas pendientes",
      footerColor: totals.pendingSignature > 0 ? warning : "text.secondary",
    },
    {
      id: "pending_report",
      label: "Informes de Lab Pendientes",
      value: String(totals.pendingReport),
      icon: "heroicons-outline:beaker",
      accent: totals.pendingReport > 0 ? purple : neutral,
      valueColor: totals.pendingReport > 0 ? purple : "text.primary",
      footer:
        totals.pendingReport > 0
          ? "Muestras derivadas en procesamiento"
          : "Resultados al día",
      footerColor: totals.pendingReport > 0 ? purple : "text.secondary",
    },
    {
      id: "unshipped_samples",
      label: "Tubos en Custodia",
      value: String(totals.unshippedSamples),
      icon: "heroicons-outline:truck",
      accent: totals.unshippedSamples > 0 ? positive : neutral,
      valueColor: totals.unshippedSamples > 0 ? positive : "text.primary",
      footer:
        totals.unshippedSamples > 0
          ? "Muestras físicas sin despachar"
          : "Sin tubos pendientes en manga",
      footerColor: "text.secondary",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.id}
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            bgcolor: isDark ? "#1e293b" : "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontSize: "0.68rem",
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
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {card.value}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: "6px",
                bgcolor: alpha(card.accent, isDark ? 0.14 : 0.1),
                color: card.accent,
                display: "flex",
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
              display: "block",
              mt: 1,
              fontSize: "0.72rem",
            }}
          >
            {card.footer}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default PortalDirectorySummaryCards;

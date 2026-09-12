import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { DiagnosticProtocol } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  pendingSignature: DiagnosticProtocol[];
  pendingLabReport: DiagnosticProtocol[];
  /** Absent when a management user is only looking: the action is not theirs to take. */
  onSign?: (act: DiagnosticProtocol) => void;
  onReport?: (act: DiagnosticProtocol) => void;
  onToggleDestinationPlan?: (act: DiagnosticProtocol) => void;
  isTogglingPlan?: boolean;
  isLoading?: boolean;
}

/**
 * The professional's inbox, split by what they actually owe:
 *
 *   1. acts of theirs still unsigned — nothing in them counts until they close the custody;
 *   2. signed acts whose tubes the laboratory has not reported on yet.
 *
 * Two different obligations with two different owners, so they never share a list.
 */
export const PortalPendingActsPanel: React.FC<Props> = ({
  pendingSignature,
  pendingLabReport,
  onSign,
  onReport,
  onToggleDestinationPlan,
  isTogglingPlan,
  isLoading,
}) => (
  <Stack spacing={2.5}>
    <ActsSection
      title="Actas pendientes de su firma"
      caption="Hasta que las firme, sus muestras no habilitan el entore."
      icon="heroicons-outline:pencil-square"
      emptyText="No tiene actas esperando firma."
      acts={pendingSignature}
      isLoading={isLoading}
      renderAction={(act) => (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            variant="outlined"
            label="Sin firmar"
            sx={{
              fontWeight: 700,
              borderRadius: "6px",
              borderColor: "#f59e0b",
              color: "#b45309",
              bgcolor: "transparent",
              height: 28,
              fontSize: "0.78rem",
            }}
          />

          {!act.is_signed && onToggleDestinationPlan && (
            <Button
              variant="outlined"
              size="small"
              disabled={isTogglingPlan}
              onClick={() => onToggleDestinationPlan(act)}
              startIcon={
                <FuseSvgIcon size={16}>
                  heroicons-outline:arrow-top-right-on-square
                </FuseSvgIcon>
              }
              sx={{
                fontWeight: 600,
                borderRadius: "6px",
                textTransform: "none",
                borderColor: act.destination_plan === "TO_BE_DERIVED" ? "primary.main" : "divider",
                color: act.destination_plan === "TO_BE_DERIVED" ? "primary.main" : "text.primary",
                bgcolor: act.destination_plan === "TO_BE_DERIVED" ? "action.hover" : "transparent",
                height: 32,
                px: 1.75,
                "&:hover": {
                  borderColor: "primary.main",
                },
              }}
            >
              {act.destination_plan === "TO_BE_DERIVED"
                ? "Marcar: In situ"
                : "Marcar: Será derivada"}
            </Button>
          )}

          {onSign && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onSign(act)}
              sx={{
                fontWeight: 700,
                borderRadius: "6px",
                textTransform: "none",
                boxShadow: "none",
                bgcolor: "#0f3a2c",
                color: "#ffffff",
                height: 32,
                px: 2,
                "&:hover": {
                  bgcolor: "#0b291f",
                },
              }}
            >
              Revisar y firmar
            </Button>
          )}
        </Stack>
      )}
    />

    <ActsSection
      title="Actas firmadas esperando laboratorio"
      caption="La cadena de custodia ya está cerrada; falta el informe con los resultados."
      icon="heroicons-outline:beaker"
      emptyText="No hay actas esperando informe de laboratorio."
      acts={pendingLabReport}
      isLoading={isLoading}
      renderAction={(act) => (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            variant="outlined"
            label="Firmada"
            color="success"
            sx={{
              fontWeight: 700,
              borderRadius: "6px",
              height: 28,
              fontSize: "0.78rem",
            }}
          />

          {act.destination_plan === "TO_BE_DERIVED" && (
            <Chip
              size="small"
              variant="outlined"
              color="info"
              label="Se deriva"
              sx={{ fontWeight: 600, borderRadius: "6px", height: 28 }}
            />
          )}

          {onReport && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onReport(act)}
              sx={{
                fontWeight: 700,
                borderRadius: "6px",
                textTransform: "none",
                height: 32,
                px: 2,
              }}
            >
              Cargar informe
            </Button>
          )}
        </Stack>
      )}
    />
  </Stack>
);

interface SectionProps {
  title: string;
  caption: string;
  icon: string;
  emptyText: string;
  acts: DiagnosticProtocol[];
  isLoading?: boolean;
  renderAction: (act: DiagnosticProtocol) => React.ReactNode;
}

const ActsSection: React.FC<SectionProps> = ({
  title,
  caption,
  icon,
  emptyText,
  acts,
  isLoading,
  renderAction,
}) => (
  <Paper
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      borderRadius: "8px",
      bgcolor: "background.paper",
    }}
  >
    <Box
      sx={{ p: 2, px: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}
    >
      <FuseSvgIcon size={20} color="action">
        {icon}
      </FuseSvgIcon>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={acts.length}
        sx={{
          fontWeight: 700,
          borderRadius: "6px",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "action.hover" : "grey.100",
          color: "text.secondary",
        }}
      />
    </Box>

    <Divider />

    {isLoading && (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
        Cargando…
      </Typography>
    )}

    {!isLoading && acts.length === 0 && (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
        {emptyText}
      </Typography>
    )}

    {!isLoading &&
      acts.map((act, index) => (
        <Box key={act.id}>
          {index > 0 && <Divider />}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ p: 2, px: 2.5 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 800, fontSize: "1rem", color: "text.primary" }}>
                {act.protocol_number}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "block", fontSize: "0.85rem", mt: 0.25 }}
              >
                Manga del {act.sample_date} • {act.samples_count} tubos
                {act.pending_samples_count > 0
                  ? ` • ${act.pending_samples_count} sin resultado`
                  : ""}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.25 }}>
                {act.has_unshipped_samples
                  ? `${act.unshipped_samples_count} tubo(s) en poder del profesional`
                  : `${act.shipped_samples_count} tubo(s) despachados`}
                {act.dispatch_note_number
                  ? ` • Remito ${act.dispatch_note_number}`
                  : ""}
              </Typography>
            </Box>

            {renderAction(act)}
          </Stack>
        </Box>
      ))}
  </Paper>
);

export default PortalPendingActsPanel;

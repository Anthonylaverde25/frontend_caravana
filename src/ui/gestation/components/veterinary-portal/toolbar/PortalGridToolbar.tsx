import React from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

export type PortalTabKey =
  | "evaluation"
  | "acts"
  | "receptions"
  | "history"
  | "access";

export interface PortalGridToolbarProps {
  activeTab?: PortalTabKey;
  onTabChange?: (tab: PortalTabKey) => void;
  pendingCount?: number;
  actsCount?: number;
  receptionsCount?: number;
  showAccessTab?: boolean;
  basePath?: string;
  onMarkAllNegative?: () => void;
  onCopyAvgCondition?: () => void;
  onImportBalanza?: () => void;
  onExportPlanilla?: () => void;
  onAddRow?: () => void;
  onOpenFilters?: () => void;
  onOpenColumns?: () => void;
}

/**
 * Dense ALV Spreadsheet Action Toolbar for Chute Evaluation.
 * Provides batch shortcuts (Mark all negative, CC average) and I/O integrations.
 */
export const PortalGridToolbar: React.FC<PortalGridToolbarProps> = ({
  onMarkAllNegative,
  onCopyAvgCondition,
  onImportBalanza,
  onExportPlanilla,
  onAddRow,
  onOpenFilters,
  onOpenColumns,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: "6px",
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
        bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#f1f5f9",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      {/* Left Batch Actions */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography
          sx={{
            fontSize: "0.74rem",
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          Acciones en lote:
        </Typography>

        {onMarkAllNegative && (
          <Button
            size="small"
            variant="outlined"
            onClick={onMarkAllNegative}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              bgcolor: "background.paper",
              color: "success.dark",
              borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0",
              borderRadius: "4px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              "&:hover": {
                bgcolor: isDark
                  ? alpha(theme.palette.success.main, 0.1)
                  : "#ecfdf5",
                borderColor: "success.main",
              },
            }}
          >
            ✓ Marcar todos Negativo (Lote Sano)
          </Button>
        )}

        {onCopyAvgCondition && (
          <Button
            size="small"
            variant="outlined"
            onClick={onCopyAvgCondition}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              bgcolor: "background.paper",
              color: "text.primary",
              borderColor: "divider",
              borderRadius: "4px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            Copiar CC promedio (3.5)
          </Button>
        )}
      </Stack>

      {/* Right Table Tools & Integrations */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {onOpenFilters && (
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenFilters}
            startIcon={
              <FuseSvgIcon size={14}>heroicons-outline:funnel</FuseSvgIcon>
            }
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.secondary",
              borderRadius: "4px",
            }}
          >
            Filtros
          </Button>
        )}

        {onOpenColumns && (
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenColumns}
            startIcon={
              <FuseSvgIcon size={14}>
                heroicons-outline:adjustments-horizontal
              </FuseSvgIcon>
            }
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.secondary",
              borderRadius: "4px",
            }}
          >
            Columnas
          </Button>
        )}

        {onAddRow && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={onAddRow}
            startIcon={
              <FuseSvgIcon size={14}>heroicons-outline:plus</FuseSvgIcon>
            }
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              bgcolor: "background.paper",
              borderRadius: "4px",
            }}
          >
            Agregar Fila
          </Button>
        )}

        {onImportBalanza && (
          <Button
            size="small"
            variant="outlined"
            onClick={onImportBalanza}
            startIcon={
              <FuseSvgIcon size={14}>
                heroicons-outline:arrow-up-tray
              </FuseSvgIcon>
            }
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              bgcolor: "background.paper",
              color: "text.secondary",
              borderColor: "divider",
              borderRadius: "4px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Importar de Balanza
          </Button>
        )}

        {onExportPlanilla && (
          <Button
            size="small"
            variant="outlined"
            onClick={onExportPlanilla}
            startIcon={
              <FuseSvgIcon size={14}>
                heroicons-outline:document-arrow-down
              </FuseSvgIcon>
            }
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              height: 28,
              bgcolor: "background.paper",
              color: "text.secondary",
              borderColor: "divider",
              borderRadius: "4px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Exportar Planilla
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default PortalGridToolbar;

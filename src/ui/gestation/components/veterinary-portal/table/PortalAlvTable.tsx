import React, { useMemo } from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  LabSampleStatus,
  PortalBull,
} from "@/core/veterinary/domain/VeterinaryTypes";
import {
  PortalBullDraft,
  PortalPathogenColumn,
} from "../PortalBullEvaluationRow";
import { PortalAlvTableRow } from "./PortalAlvTableRow";
import { PortalAlvTableFooter } from "./PortalAlvTableFooter";

interface PortalAlvTableProps {
  bulls: PortalBull[];
  pathogens: PortalPathogenColumn[];
  selectedIds: number[];
  drafts: Record<number, PortalBullDraft>;
  onToggle: (caravanId: number) => void;
  onToggleAll: () => void;
  onDraftChange: (caravanId: number, patch: Partial<PortalBullDraft>) => void;
  onResultChange: (
    caravanId: number,
    pathogenId: number,
    status: LabSampleStatus,
  ) => void;
}

/**
 * Enterprise Veterinary Chute Table matching PedigreeDataTable design pattern.
 * Uses MUI Paper container, sticky headers, subtle borders, and system typography.
 */
export const PortalAlvTable: React.FC<PortalAlvTableProps> = ({
  bulls,
  pathogens,
  selectedIds,
  drafts,
  onToggle,
  onToggleAll,
  onDraftChange,
  onResultChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const headerBg = isDark ? "#1e293b" : "#f8fafc";

  const allSelected = useMemo(
    () =>
      bulls.length > 0 &&
      bulls.every((b) => selectedIds.includes(b.caravan_id)),
    [bulls, selectedIds],
  );

  const isIndeterminate = useMemo(
    () => selectedIds.length > 0 && !allSelected,
    [selectedIds, allSelected],
  );

  const headerCellStyle = {
    py: 1.25,
    px: 1.25,
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    color: isDark ? "#94a3b8" : "#475569",
    borderBottom: "1px solid",
    borderRight: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    whiteSpace: "nowrap" as const,
    letterSpacing: "0.04em",
    bgcolor: headerBg,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: theme.palette.divider,
        borderRadius: "6px",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader sx={{ minWidth: 1250, borderCollapse: "collapse" }}>
          {/* Sticky Table Header */}
          <TableHead>
            <TableRow sx={{ bgcolor: headerBg }}>
              {/* 0. Select All Checkbox */}
              <TableCell
                sx={{
                  ...headerCellStyle,
                  width: 44,
                  textAlign: "center",
                  p: 0.5,
                }}
              >
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleAll}
                  sx={{
                    p: 0.5,
                    color: "primary.main",
                    "&.Mui-checked": { color: "success.main" },
                  }}
                />
              </TableCell>

              {/* 1. Index # */}
              <TableCell
                sx={{ ...headerCellStyle, width: 44, textAlign: "center" }}
              >
                #
              </TableCell>

              {/* 2. Caravana / ID */}
              <TableCell sx={{ ...headerCellStyle, minWidth: 170 }}>
                Caravana / ID
              </TableCell>

              {/* 3. C.E. (cm) */}
              <TableCell
                sx={{ ...headerCellStyle, width: 90, textAlign: "center" }}
              >
                C.E. (cm)
              </TableCell>

              {/* 4. CC (1-5) */}
              <TableCell
                sx={{ ...headerCellStyle, width: 80, textAlign: "center" }}
              >
                CC (1-5)
              </TableCell>

              {/* 5. Libido */}
              <TableCell sx={{ ...headerCellStyle, width: 115 }}>
                Libido
              </TableCell>

              {/* 6..N Pathogens */}
              {pathogens.map((pathogen) => (
                <TableCell
                  key={pathogen.id}
                  sx={{ ...headerCellStyle, minWidth: 130 }}
                >
                  {pathogen.name}
                </TableCell>
              ))}

              {/* Observaciones */}
              <TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>
                Observaciones
              </TableCell>

              {/* Dictamen */}
              <TableCell
                sx={{
                  ...headerCellStyle,
                  width: 95,
                  textAlign: "center",
                  borderRight: 0,
                }}
              >
                Dictamen
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {bulls.map((bull, index) => {
              const draft = drafts[bull.caravan_id] ?? {
                scrotal_circumference_cm: "",
                body_condition_score: "",
                aplomo_notes: "",
                libido: "MEDIA",
                results: {},
              };

              return (
                <PortalAlvTableRow
                  key={bull.caravan_id}
                  index={index + 1}
                  bull={bull}
                  pathogens={pathogens}
                  selected={selectedIds.includes(bull.caravan_id)}
                  draft={draft}
                  onToggle={onToggle}
                  onDraftChange={onDraftChange}
                  onResultChange={onResultChange}
                  isEven={index % 2 === 1}
                />
              );
            })}

            {bulls.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={pathogens.length + 8}
                  sx={{ py: 8, textAlign: "center", color: "text.secondary" }}
                >
                  <Box
                    sx={{ mb: 1, display: "flex", justifyContent: "center" }}
                  >
                    <FuseSvgIcon size={36} color="disabled">
                      heroicons-outline:magnifying-glass
                    </FuseSvgIcon>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    No hay reproductores disponibles en la tropa seleccionada
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Seleccione otro lote en el encabezado o verifique la
                    asignación de animales.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Table Footer with live totals */}
          {bulls.length > 0 && (
            <PortalAlvTableFooter
              totalBulls={bulls.length}
              drafts={drafts}
              pathogens={pathogens}
              selectedIds={selectedIds}
            />
          )}
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PortalAlvTable;

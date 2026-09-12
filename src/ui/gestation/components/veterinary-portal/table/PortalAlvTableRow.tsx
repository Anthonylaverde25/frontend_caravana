import React, { useMemo } from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  Stack,
  Avatar,
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  TextField,
  useTheme,
  alpha,
} from "@mui/material";
import {
  LabSampleStatus,
  PortalBull,
} from "@/core/veterinary/domain/VeterinaryTypes";
import {
  PortalBullDraft,
  PortalPathogenColumn,
} from "../PortalBullEvaluationRow";

interface PortalAlvTableRowProps {
  index: number;
  bull: PortalBull;
  pathogens: PortalPathogenColumn[];
  selected: boolean;
  draft: PortalBullDraft;
  onToggle: (caravanId: number) => void;
  onDraftChange: (caravanId: number, patch: Partial<PortalBullDraft>) => void;
  onResultChange: (
    caravanId: number,
    pathogenId: number,
    status: LabSampleStatus,
  ) => void;
  isEven?: boolean;
}

/**
 * High-density veterinary evaluation table row matching PedigreeTableRow pattern.
 * Uses system MUI typography, Avatar badge, and compact form controls.
 */
export const PortalAlvTableRow: React.FC<PortalAlvTableRowProps> = ({
  index,
  bull,
  pathogens,
  selected,
  draft,
  onToggle,
  onDraftChange,
  onResultChange,
  isEven = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const zebraBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#fafafa";
  const rowBg = selected
    ? isDark
      ? "rgba(16, 185, 129, 0.16)"
      : "#e8f5e9"
    : isEven
      ? zebraBg
      : "inherit";

  const bodyCellStyle = {
    px: 1.25,
    py: 0.85,
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
    fontSize: "0.78rem",
  };

  // Compute live dictamen
  const dictamen = useMemo<{
    label: string;
    color: "success" | "error" | "warning" | "default";
  }>(() => {
    const resultsList = Object.values(draft.results || {});
    if (resultsList.some((r) => r === "POSITIVE_DETECTED")) {
      return { label: "No Apto", color: "error" };
    }

    const allTested =
      pathogens.length > 0 &&
      pathogens.every(
        (p) => draft.results[p.id] && draft.results[p.id] !== "PENDING_RESULTS",
      );

    if (selected && allTested) {
      return { label: "Apto", color: "success" };
    }

    return { label: "Pendiente", color: "default" };
  }, [draft.results, pathogens, selected]);

  const getPathogenColors = (status?: LabSampleStatus) => {
    switch (status) {
      case "POSITIVE_DETECTED":
        return {
          bgcolor: isDark ? alpha(theme.palette.error.main, 0.2) : "#fef2f2",
          color: theme.palette.error.main,
          borderColor: isDark ? theme.palette.error.dark : "#fca5a5",
        };
      case "PENDING_RESULTS":
        return {
          bgcolor: isDark ? alpha(theme.palette.warning.main, 0.2) : "#fffbeb",
          color: theme.palette.warning.main,
          borderColor: isDark ? theme.palette.warning.dark : "#fcd34d",
        };
      case "NEGATIVE_CLEARED":
      default:
        return {
          bgcolor: isDark ? alpha(theme.palette.success.main, 0.15) : "#ecfdf5",
          color: theme.palette.success.dark,
          borderColor: isDark ? theme.palette.success.dark : "#a7f3d0",
        };
    }
  };

  return (
    <TableRow
      hover
      sx={{
        bgcolor: rowBg,
        "&:hover": {
          bgcolor: selected
            ? isDark
              ? "rgba(16, 185, 129, 0.24)"
              : "#dcfce7"
            : isDark
              ? "rgba(255, 255, 255, 0.04)"
              : "#f8fafc",
        },
        transition: "background-color 0.15s ease",
      }}
    >
      {/* 0. Checkbox */}
      <TableCell
        sx={{ ...bodyCellStyle, textAlign: "center", p: 0.5, width: 44 }}
      >
        <Checkbox
          size="small"
          checked={selected}
          onChange={() => onToggle(bull.caravan_id)}
          sx={{
            p: 0.5,
            color: "primary.main",
            "&.Mui-checked": { color: "success.main" },
          }}
        />
      </TableCell>

      {/* 1. Index */}
      <TableCell
        sx={{
          ...bodyCellStyle,
          textAlign: "center",
          color: "text.secondary",
          fontSize: "0.75rem",
          fontWeight: 600,
          fontFamily: "monospace",
          width: 44,
        }}
      >
        {index}
      </TableCell>

      {/* 2. Caravana / Animal */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 170 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 26,
              height: 26,
              bgcolor: "info.light",
              color: "info.contrastText",
              fontSize: "0.7rem",
              fontWeight: 800,
            }}
          >
            ♂
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontWeight: 800,
                color: "primary.main",
                fontSize: "0.82rem",
                lineHeight: 1.1,
              }}
            >
              #{bull.identification}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.68rem",
                display: "block",
              }}
            >
              {bull.aptitude_status === "FIT_VALIDATED"
                ? "APTO VIGENTE"
                : bull.aptitude_status === "REJECTED_DISQUALIFIED"
                  ? "NO APTO"
                  : "PENDIENTE EVALUACIÓN"}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* 3. C.E. (cm) */}
      <TableCell sx={{ ...bodyCellStyle, width: 90, textAlign: "center" }}>
        <TextField
          size="small"
          type="number"
          placeholder="CE cm"
          value={draft.scrotal_circumference_cm}
          onChange={(e) =>
            onDraftChange(bull.caravan_id, {
              scrotal_circumference_cm: e.target.value,
            })
          }
          inputProps={{
            step: 0.5,
            style: {
              textAlign: "center",
              fontSize: "0.78rem",
              padding: "4px 6px",
              height: 20,
            },
          }}
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": { borderRadius: "4px" },
          }}
        />
      </TableCell>

      {/* 4. CC (1-5) */}
      <TableCell sx={{ ...bodyCellStyle, width: 80, textAlign: "center" }}>
        <TextField
          size="small"
          type="number"
          placeholder="CC"
          value={draft.body_condition_score}
          onChange={(e) =>
            onDraftChange(bull.caravan_id, {
              body_condition_score: e.target.value,
            })
          }
          inputProps={{
            min: 1,
            max: 5,
            step: 0.5,
            style: {
              textAlign: "center",
              fontSize: "0.78rem",
              padding: "4px 6px",
              height: 20,
            },
          }}
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": { borderRadius: "4px" },
          }}
        />
      </TableCell>

      {/* 5. Libido */}
      <TableCell sx={{ ...bodyCellStyle, width: 115 }}>
        <Select
          size="small"
          value={draft.libido}
          onChange={(e) =>
            onDraftChange(bull.caravan_id, { libido: e.target.value })
          }
          sx={{
            width: "100%",
            fontSize: "0.78rem",
            height: 28,
            bgcolor: "background.paper",
            borderRadius: "4px",
          }}
        >
          <option value="BAJA" style={{ display: "none" }} />
          <MenuItem value="BAJA" sx={{ fontSize: "0.78rem" }}>
            BAJA
          </MenuItem>
          <MenuItem value="MEDIA" sx={{ fontSize: "0.78rem" }}>
            MEDIA
          </MenuItem>
          <MenuItem value="ALTA" sx={{ fontSize: "0.78rem" }}>
            ALTA
          </MenuItem>
          <MenuItem value="MUY_ALTA" sx={{ fontSize: "0.78rem" }}>
            MUY ALTA
          </MenuItem>
        </Select>
      </TableCell>

      {/* 6..N Dynamic Pathogens */}
      {pathogens.map((pathogen) => {
        const currentStatus = draft.results[pathogen.id] ?? "NEGATIVE_CLEARED";
        const colors = getPathogenColors(currentStatus);

        return (
          <TableCell key={pathogen.id} sx={{ ...bodyCellStyle, minWidth: 130 }}>
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) =>
                onResultChange(
                  bull.caravan_id,
                  pathogen.id,
                  e.target.value as LabSampleStatus,
                )
              }
              sx={{
                width: "100%",
                fontSize: "0.76rem",
                fontWeight: 600,
                height: 28,
                bgcolor: colors.bgcolor,
                color: colors.color,
                borderRadius: "4px",
                border: "1px solid",
                borderColor: colors.borderColor,
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            >
              <MenuItem
                value="NEGATIVE_CLEARED"
                sx={{
                  fontSize: "0.78rem",
                  color: "success.dark",
                  fontWeight: 600,
                }}
              >
                Negativo
              </MenuItem>
              <MenuItem
                value="POSITIVE_DETECTED"
                sx={{
                  fontSize: "0.78rem",
                  color: "error.main",
                  fontWeight: 600,
                }}
              >
                Positivo
              </MenuItem>
              <MenuItem
                value="PENDING_RESULTS"
                sx={{
                  fontSize: "0.78rem",
                  color: "warning.main",
                  fontWeight: 600,
                }}
              >
                Pendiente
              </MenuItem>
            </Select>
          </TableCell>
        );
      })}

      {/* Observaciones */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 180 }}>
        <TextField
          size="small"
          placeholder="Aplomos normales, sin lesiones"
          value={draft.aplomo_notes}
          onChange={(e) =>
            onDraftChange(bull.caravan_id, { aplomo_notes: e.target.value })
          }
          inputProps={{
            style: {
              fontSize: "0.78rem",
              padding: "4px 8px",
              height: 20,
            },
          }}
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": { borderRadius: "4px" },
          }}
        />
      </TableCell>

      {/* Dictamen */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: "center", width: 95 }}>
        <Chip
          label={dictamen.label}
          size="small"
          color={dictamen.color}
          variant={dictamen.color === "default" ? "outlined" : "filled"}
          sx={{
            height: 22,
            fontSize: "0.68rem",
            fontWeight: 700,
            borderRadius: "4px",
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default PortalAlvTableRow;

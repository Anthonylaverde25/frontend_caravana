import React, { useMemo } from "react";
import {
  TableFooter,
  TableRow,
  TableCell,
  Typography,
  useTheme,
} from "@mui/material";
import {
  PortalBullDraft,
  PortalPathogenColumn,
} from "../PortalBullEvaluationRow";

interface PortalAlvTableFooterProps {
  totalBulls: number;
  drafts: Record<number, PortalBullDraft>;
  pathogens: PortalPathogenColumn[];
  selectedIds: number[];
}

/**
 * Summary footer row (∑) using MUI TableFooter matching PedigreeDataTable theme and font scale.
 */
export const PortalAlvTableFooter: React.FC<PortalAlvTableFooterProps> = ({
  totalBulls,
  drafts,
  pathogens,
  selectedIds,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const footerBg = isDark ? "#1e293b" : "#f8fafc";
  const cellStyle = {
    px: 1.25,
    py: 1,
    borderRight: "1px solid",
    borderTop: "2px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1",
    bgcolor: footerBg,
    fontSize: "0.74rem",
    fontWeight: 700,
  };

  const stats = useMemo(() => {
    const draftValues = Object.values(drafts);

    const ceValues = draftValues
      .map((d) => parseFloat(d.scrotal_circumference_cm))
      .filter((v) => !isNaN(v) && v > 0);
    const avgCe =
      ceValues.length > 0
        ? (ceValues.reduce((a, b) => a + b, 0) / ceValues.length).toFixed(1)
        : null;

    const ccValues = draftValues
      .map((d) => parseFloat(d.body_condition_score))
      .filter((v) => !isNaN(v) && v > 0);
    const avgCc =
      ccValues.length > 0
        ? (ccValues.reduce((a, b) => a + b, 0) / ccValues.length).toFixed(1)
        : null;

    let positiveCount = 0;
    draftValues.forEach((d) => {
      Object.values(d.results || {}).forEach((status) => {
        if (status === "POSITIVE_DETECTED") {
          positiveCount += 1;
        }
      });
    });

    let aptosCount = 0;
    let noAptosCount = 0;
    selectedIds.forEach((id) => {
      const draft = drafts[id];
      if (!draft) return;
      const res = Object.values(draft.results || {});
      if (res.some((r) => r === "POSITIVE_DETECTED")) {
        noAptosCount += 1;
      } else if (
        pathogens.length > 0 &&
        pathogens.every(
          (p) =>
            draft.results[p.id] && draft.results[p.id] !== "PENDING_RESULTS",
        )
      ) {
        aptosCount += 1;
      }
    });

    const pendingCount = totalBulls - aptosCount - noAptosCount;

    return {
      avgCe,
      avgCc,
      positiveCount,
      aptosCount,
      noAptosCount,
      pendingCount: Math.max(0, pendingCount),
    };
  }, [drafts, pathogens, selectedIds, totalBulls]);

  return (
    <TableFooter>
      <TableRow>
        {/* Sum Symbol */}
        <TableCell
          sx={{
            ...cellStyle,
            textAlign: "center",
            fontFamily: "monospace",
            color: "text.secondary",
          }}
        >
          ∑
        </TableCell>

        {/* Count */}
        <TableCell
          sx={{
            ...cellStyle,
            textAlign: "center",
            fontFamily: "monospace",
            color: "text.secondary",
          }}
        >
          {totalBulls}
        </TableCell>

        {/* Reproductores totales */}
        <TableCell sx={cellStyle}>
          <Typography
            sx={{ fontSize: "0.74rem", fontWeight: 700, color: "text.primary" }}
          >
            {totalBulls} Reproductores en lote
          </Typography>
        </TableCell>

        {/* CE Avg */}
        <TableCell
          sx={{
            ...cellStyle,
            textAlign: "center",
            fontFamily: "monospace",
            color: "text.primary",
          }}
        >
          {stats.avgCe ? `Ø ${stats.avgCe} cm` : "Ø -- cm"}
        </TableCell>

        {/* CC Avg */}
        <TableCell
          sx={{
            ...cellStyle,
            textAlign: "center",
            fontFamily: "monospace",
            color: "text.primary",
          }}
        >
          {stats.avgCc ? `Ø ${stats.avgCc}` : "Ø --"}
        </TableCell>

        {/* Libido */}
        <TableCell
          sx={{ ...cellStyle, textAlign: "center", color: "text.disabled" }}
        >
          -
        </TableCell>

        {/* Pathogen status summary */}
        <TableCell
          colSpan={Math.max(1, pathogens.length)}
          sx={{
            ...cellStyle,
            textAlign: "center",
            color: stats.positiveCount > 0 ? "error.main" : "success.dark",
          }}
        >
          {stats.positiveCount === 0
            ? "0 Positivos reportados en el lote actual"
            : `${stats.positiveCount} Positivo(s) reportado(s)`}
        </TableCell>

        {/* Alerta Sanitaria */}
        <TableCell
          sx={{
            ...cellStyle,
            color: stats.positiveCount > 0 ? "error.main" : "text.secondary",
          }}
        >
          {stats.positiveCount > 0 ? "⚠️ Alerta sanitaria" : "Sin alertas"}
        </TableCell>

        {/* Dictamen summary */}
        <TableCell
          sx={{ ...cellStyle, textAlign: "center", color: "text.secondary" }}
        >
          {stats.aptosCount} Aptos / {stats.pendingCount} Pend.
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

export default PortalAlvTableFooter;

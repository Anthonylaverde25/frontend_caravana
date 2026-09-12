import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { ProtocolLabSample } from "@/core/veterinary/domain/VeterinaryTypes";
import { groupSamplesByTube } from "./actTubes";

interface Props {
  samples: ProtocolLabSample[];
}

/**
 * The tubes an act certifies, in the spreadsheet style the pedigree screen established.
 *
 * One row per PHYSICAL TUBE. The database stores one row per determination — a preputial scrape is
 * cultured for both venereal agents, and aptitude is counted per agent — so an unGrouped table
 * showed the same tube number twice and claimed the act held two tubes. The person signing is
 * looking at one tube in their hand, so the register groups back to it and names both agents.
 *
 * It reads like a register rather than a list on purpose: this is the evidence the professional is
 * putting their licence behind, and a register is what one checks line by line. The header sticks,
 * because an act with thirty tubes scrolls and the column names have to stay visible.
 */
export const ActTubesTable: React.FC<Props> = ({ samples }) => {
  const tubes = groupSamplesByTube(samples);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const headerBg = isDark ? "#1e293b" : "#f8fafc";
  const zebraBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#fafafa";

  const headerCellStyle = {
    py: 1.25,
    px: 1.5,
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

  const bodyCellStyle = {
    px: 1.5,
    py: 1.1,
    fontSize: "0.8rem",
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "4px",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <TableContainer sx={{ maxHeight: 320 }}>
        <Table stickyHeader size="small" sx={{ minWidth: 620, borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: headerBg }}>
              <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: "center" }}>#</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Caravana</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Ensayo</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>Agentes que descarta</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Tubo</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 80, textAlign: "center", borderRight: 0 }}>
                Ronda
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tubes.map((tube, index) => (
              <TableRow
                key={tube.key}
                hover
                sx={{ bgcolor: index % 2 === 1 ? zebraBg : "transparent" }}
              >
                <TableCell
                  sx={{
                    ...bodyCellStyle,
                    textAlign: "center",
                    color: "text.disabled",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {index + 1}
                </TableCell>
                <TableCell sx={{ ...bodyCellStyle, fontWeight: 600 }}>
                  {tube.caravanLabel}
                </TableCell>
                <TableCell sx={bodyCellStyle}>{tube.sampleType}</TableCell>
                <TableCell sx={bodyCellStyle}>
                  {tube.agents.length === 0 ? (
                    "—"
                  ) : (
                    <Stack spacing={0.25}>
                      {tube.agents.map((agent) => (
                        <Typography key={agent} variant="caption" sx={{ lineHeight: 1.4 }}>
                          {agent}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                  {/* Two agents off one tube is the norm for a scrape, not a duplicate. */}
                  {tube.determinationCount > 1 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.25 }}
                    >
                      {tube.determinationCount} determinaciones sobre este tubo
                    </Typography>
                  )}
                </TableCell>
                {/* The tube number is the thread tying a result back to an animal (ADR-13). */}
                <TableCell sx={{ ...bodyCellStyle, fontFamily: "monospace", fontWeight: 700 }}>
                  {tube.tubeNumber ?? "—"}
                </TableCell>
                <TableCell
                  sx={{
                    ...bodyCellStyle,
                    textAlign: "center",
                    borderRight: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {tube.sampleRound}
                </TableCell>
              </TableRow>
            ))}

            {tubes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
                  <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
                    <FuseSvgIcon size={32} color="disabled">
                      heroicons-outline:beaker
                    </FuseSvgIcon>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Esta acta no registró tubos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Certifica únicamente el examen físico de manga. No va a poder recibir un
                    informe de laboratorio, porque no hay muestra que analizar.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ActTubesTable;

import React, { useState, useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { PortalDirectoryRow } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  rows: PortalDirectoryRow[];
  isLoading: boolean;
  onInspect: (row: PortalDirectoryRow) => void;
  onOpenLinkDialog: (row: PortalDirectoryRow) => void;
}

export const PortalDirectoryTable: React.FC<Props> = ({
  rows,
  isLoading,
  onInspect,
  onOpenLinkDialog,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const headerBg = isDark ? "#1e293b" : "#f8fafc";
  const zebraBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#fafafa";

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const headerCellStyle = {
    py: 1.5,
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
    py: 1.2,
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: theme.palette.divider,
        borderRadius: "4px",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 920 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellStyle, minWidth: 260 }}>Profesional / Matrícula</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>Estado de Acceso</TableCell>
              <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 110 }}>
                Por firmar
              </TableCell>
              <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 110 }}>
                Sin informe
              </TableCell>
              <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 110 }}>
                Tubos en mano
              </TableCell>
              <TableCell align="right" sx={{ ...headerCellStyle, borderRight: "none", minWidth: 190 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron profesionales que coincidan con los filtros aplicados.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginatedRows.map((row, index) => {
                const isEven = index % 2 === 1;
                const hasPendingActions =
                  row.pending_signature_count > 0 || row.pending_lab_report_count > 0;

                const initials = row.name
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <TableRow
                    key={row.veterinarian_id}
                    hover
                    sx={{
                      bgcolor: isEven ? zebraBg : "inherit",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* 1. Professional info */}
                    <TableCell sx={bodyCellStyle}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            bgcolor: isDark ? "primary.dark" : "primary.light",
                            color: isDark ? "primary.contrastText" : "primary.main",
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            M.P. {row.license_number}
                            {row.email ? ` · ${row.email}` : " · sin correo"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* 2. Access state */}
                    <TableCell sx={bodyCellStyle}>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          color={row.has_portal_account ? "success" : "default"}
                          label={row.has_portal_account ? "Con cuenta" : "Sin cuenta"}
                          sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                        />
                        {row.active_token_count > 0 && (
                          <Tooltip
                            title={
                              row.token_expires_at
                                ? `El más próximo vence el ${row.token_expires_at}`
                                : ""
                            }
                          >
                            <Chip
                              size="small"
                              variant="outlined"
                              color="info"
                              label={
                                row.active_token_count === 1
                                  ? "1 enlace vigente"
                                  : `${row.active_token_count} enlaces vigentes`
                              }
                              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                      {row.last_portal_access_at && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
                        >
                          Último ingreso: {row.last_portal_access_at}
                        </Typography>
                      )}
                    </TableCell>

                    {/* 3. Pending signature */}
                    <TableCell align="center" sx={bodyCellStyle}>
                      <CountBadge value={row.pending_signature_count} tone="warning" isDark={isDark} />
                    </TableCell>

                    {/* 4. Pending lab report */}
                    <TableCell align="center" sx={bodyCellStyle}>
                      <CountBadge value={row.pending_lab_report_count} tone="purple" isDark={isDark} />
                    </TableCell>

                    {/* 5. Unshipped samples */}
                    <TableCell align="center" sx={bodyCellStyle}>
                      <CountBadge value={row.unshipped_samples_count} tone="neutral" isDark={isDark} />
                    </TableCell>

                    {/* 6. Actions */}
                    <TableCell align="right" sx={{ ...bodyCellStyle, borderRight: "none" }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Abre su portal en una pestaña nueva (modo supervisión / solo lectura)">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onInspect(row)}
                            startIcon={<FuseSvgIcon size={14}>heroicons-outline:eye</FuseSvgIcon>}
                            sx={{
                              fontWeight: 600,
                              textTransform: "none",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              py: 0.4,
                              px: 1.25,
                            }}
                          >
                            Inspeccionar
                          </Button>
                        </Tooltip>
                        <Tooltip title="Generar enlace temporal o enviarlo por correo">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => onOpenLinkDialog(row)}
                            startIcon={<FuseSvgIcon size={14}>heroicons-outline:link</FuseSvgIcon>}
                            sx={{
                              fontWeight: 600,
                              textTransform: "none",
                              borderRadius: "6px",
                              boxShadow: "none",
                              fontSize: "0.75rem",
                              py: 0.4,
                              px: 1.25,
                            }}
                          >
                            Enlace
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <TablePagination
        rowsPerPageOptions={[10, 15, 25, 50]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{
          borderTop: 1,
          borderColor: theme.palette.divider,
          bgcolor: isDark ? "#1e293b" : "#f8fafc",
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.78rem",
          },
        }}
      />
    </Paper>
  );
};

const CountBadge: React.FC<{
  value: number;
  tone: "warning" | "purple" | "neutral";
  isDark: boolean;
}> = ({ value, tone, isDark }) => {
  if (value === 0) {
    return (
      <Typography
        variant="body2"
        sx={{ color: "text.disabled", fontVariantNumeric: "tabular-nums", fontSize: "0.82rem" }}
      >
        0
      </Typography>
    );
  }

  const colorStyles = {
    warning: {
      color: isDark ? "#fb923c" : "#c2410c",
      bgcolor: isDark ? "rgba(251, 146, 60, 0.16)" : "#ffedd5",
      border: isDark ? "1px solid rgba(251, 146, 60, 0.3)" : "1px solid #fed7aa",
    },
    purple: {
      color: isDark ? "#c084fc" : "#7e22ce",
      bgcolor: isDark ? "rgba(192, 132, 252, 0.16)" : "#f3e8ff",
      border: isDark ? "1px solid rgba(192, 132, 252, 0.3)" : "1px solid #e9d5ff",
    },
    neutral: {
      color: isDark ? "#94a3b8" : "#475569",
      bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
      border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0",
    },
  };

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 26,
        height: 22,
        px: 0.8,
        borderRadius: "11px",
        fontWeight: 700,
        fontSize: "0.75rem",
        fontVariantNumeric: "tabular-nums",
        ...colorStyles[tone],
      }}
    >
      {value}
    </Box>
  );
};

export default PortalDirectoryTable;

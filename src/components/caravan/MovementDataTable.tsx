import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CaravanMovement } from '@/core/caravans/domain/entities/CaravanMovement';
import MovementToolbar from './MovementToolbar';

interface MovementDataTableProps {
  data: CaravanMovement[];
  isLoading?: boolean;
  onCaravanClick?: (identification: string) => void;
}

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    color: 'success' | 'primary' | 'warning' | 'default';
  }
> = {
  ENTRY: {
    label: 'ENTRADA',
    icon: 'heroicons-outline:arrow-down-circle',
    color: 'success',
  },
  TRANSFER: {
    label: 'TRANSFERENCIA',
    icon: 'heroicons-outline:arrows-right-left',
    color: 'primary',
  },
  EXIT: {
    label: 'SALIDA',
    icon: 'heroicons-outline:arrow-up-circle',
    color: 'warning',
  },
  ORIGIN: {
    label: 'ORIGEN',
    icon: 'heroicons-outline:home',
    color: 'default',
  },
};

/**
 * MovementDataTable Component
 * Canonical spreadsheet-style datatable for caravan movements matching ExternalBatchAssignmentView pattern.
 */
export default function MovementDataTable({
  data = [],
  isLoading = false,
  onCaravanClick,
}: MovementDataTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
  const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';

  const headerCellStyle = {
    py: 1.5,
    px: 1.5,
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: isDark ? '#94a3b8' : '#475569',
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: headerBorder,
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.04em',
    bgcolor: headerBg,
  };

  const bodyCellStyle = {
    px: 1.5,
    py: 1.1,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: bodyBorder,
  };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedType]);

  // Filtering
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return data.filter((item) => {
      // Filter by type
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      // Filter by search term
      if (term !== '') {
        const matchesIdentification = item.identification?.toLowerCase().includes(term);
        const matchesRenspa = item.renspa?.toLowerCase().includes(term);
        const matchesType = item.type?.toLowerCase().includes(term);
        const matchesObs = item.observations?.toLowerCase().includes(term);
        return matchesIdentification || matchesRenspa || matchesType || matchesObs;
      }

      return true;
    });
  }, [data, searchTerm, selectedType]);

  // Pagination
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box className="w-full">
      {/* Barra de Filtros Canónica */}
      <MovementToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        totalCount={filteredData.length}
      />

      {/* Contenedor de Tabla Fiori / Canónico */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '4px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 330px)' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 950, borderCollapse: 'collapse' }}>
            <TableHead>
              {/* Fila 1: Bandas de Agrupación de Cabecera */}
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{
                    bgcolor: headerBg,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid',
                    borderRight: '1px solid',
                    borderColor: headerBorder,
                    py: 1,
                  }}
                >
                  Identificación y Evento
                </TableCell>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.05),
                    color: 'primary.main',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid',
                    borderRight: '1px solid',
                    borderColor: headerBorder,
                    py: 1,
                  }}
                >
                  Trazabilidad y Ubicación
                </TableCell>
                <TableCell
                  colSpan={1}
                  align="center"
                  sx={{
                    bgcolor: headerBg,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid',
                    borderColor: headerBorder,
                    py: 1,
                  }}
                >
                  Detalle y Auditoría
                </TableCell>
              </TableRow>

              {/* Fila 2: Columnas Específicas */}
              <TableRow>
                <TableCell sx={{ ...headerCellStyle, width: 50, textAlign: 'center' }}>
                  #
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>
                  Caravana
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>
                  Tipo Evento
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>
                  Fecha
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 190 }}>
                  RENSPA / Origen
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 260, borderRight: 0 }}>
                  Observaciones / Detalle
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((movement, index) => {
                const config = TYPE_CONFIG[movement.type] || TYPE_CONFIG.TRANSFER;
                const rowBg = index % 2 === 1 ? zebraBg : 'inherit';

                return (
                  <TableRow
                    key={movement.id || `${movement.identification}-${movement.movementDate}-${index}`}
                    hover
                    sx={{
                      bgcolor: rowBg,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Index */}
                    <TableCell
                      sx={{
                        ...bodyCellStyle,
                        textAlign: 'center',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {page * rowsPerPage + index + 1}
                    </TableCell>

                    {/* Caravana */}
                    <TableCell sx={bodyCellStyle}>
                      <Typography
                        component="span"
                        onClick={() => movement.identification && onCaravanClick?.(movement.identification)}
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: 'primary.main',
                          fontSize: '0.85rem',
                          cursor: movement.identification ? 'pointer' : 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          '&:hover': movement.identification
                            ? { textDecoration: 'underline' }
                            : undefined,
                        }}
                      >
                        #{movement.identification || 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Tipo Evento */}
                    <TableCell sx={bodyCellStyle}>
                      <Chip
                        size="small"
                        icon={
                          <FuseSvgIcon size={15} color="inherit">
                            {config.icon}
                          </FuseSvgIcon>
                        }
                        label={config.label}
                        color={config.color}
                        variant={config.color === 'default' ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 24,
                          letterSpacing: '0.02em',
                        }}
                      />
                    </TableCell>

                    {/* Fecha */}
                    <TableCell sx={bodyCellStyle}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FuseSvgIcon size={14} color="disabled">
                          heroicons-outline:calendar
                        </FuseSvgIcon>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            color: 'text.primary',
                          }}
                        >
                          {movement.movementDate || '-'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* RENSPA / Origen */}
                    <TableCell sx={bodyCellStyle}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FuseSvgIcon size={14} color="disabled">
                          heroicons-outline:map-pin
                        </FuseSvgIcon>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            color: 'text.secondary',
                          }}
                        >
                          {movement.renspa || 'NO_DEFINIDO'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Observaciones */}
                    <TableCell sx={{ ...bodyCellStyle, borderRight: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: movement.observations ? 'text.secondary' : 'text.disabled',
                          fontStyle: movement.observations ? 'italic' : 'normal',
                          fontSize: '0.78rem',
                        }}
                      >
                        {movement.observations || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Empty state */}
              {paginatedRows.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}
                  >
                    <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                      <FuseSvgIcon size={36} color="disabled">
                        heroicons-outline:magnifying-glass
                      </FuseSvgIcon>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      No se encontraron movimientos registrados
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Intente modificar el término de búsqueda o seleccione otro tipo de movimiento.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación nativa MUI */}
        <TablePagination
          rowsPerPageOptions={[10, 15, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: theme.palette.divider,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.78rem',
              color: 'text.secondary',
            },
          }}
        />
      </Paper>
    </Box>
  );
}

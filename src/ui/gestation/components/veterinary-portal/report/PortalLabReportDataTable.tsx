import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TablePagination,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Chip,
  MenuItem,
  Select,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  LabSampleStatus,
  ProtocolLabSample,
} from '@/core/veterinary/domain/VeterinaryTypes';

type FilterType = 'ALL' | 'PENDING' | 'NEGATIVE' | 'POSITIVE';

interface PortalLabReportDataTableProps {
  samples: ProtocolLabSample[];
  results: Record<number, LabSampleStatus>;
  onResultChange: (sampleId: number, status: LabSampleStatus) => void;
  onApplyToAll: (status: LabSampleStatus) => void;
  disabled?: boolean;
}

const FILTER_ITEMS: { id: FilterType; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'NEGATIVE', label: 'Negativos' },
  { id: 'POSITIVE', label: 'Positivos' },
];

/**
 * Diagnostic Lab Report Data Table matching the exact UI architecture and styling of PedigreeDataTable.
 * Clean, card-less, dense spreadsheet grid with search, filter pills, bulk actions, and pagination.
 */
export const PortalLabReportDataTable: React.FC<PortalLabReportDataTableProps> = ({
  samples,
  results,
  onResultChange,
  onApplyToAll,
  disabled = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
  const activeColor = isDark ? '#60a5fa' : '#0a6ed1';

  const resolvedCount = useMemo(
    () => Object.values(results).filter((v) => v !== 'PENDING_RESULTS').length,
    [results],
  );

  // Filtered samples based on search and status pill
  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      const q = searchTerm.trim().toLowerCase();
      const caravanStr = String(sample.caravan_number ?? sample.caravan_id ?? '').toLowerCase();
      const pathogenStr = String(sample.pathogen_name ?? sample.pathogen_code ?? '').toLowerCase();
      const tubeStr = String(sample.tube_number ?? '').toLowerCase();

      const matchesSearch =
        q === '' ||
        caravanStr.includes(q) ||
        pathogenStr.includes(q) ||
        tubeStr.includes(q);

      if (!matchesSearch) return false;

      const currentStatus = results[sample.id] ?? 'PENDING_RESULTS';
      if (filterType === 'PENDING') return currentStatus === 'PENDING_RESULTS';
      if (filterType === 'NEGATIVE') return currentStatus === 'NEGATIVE_CLEARED';
      if (filterType === 'POSITIVE') return currentStatus === 'POSITIVE_DETECTED';

      return true;
    });
  }, [samples, results, searchTerm, filterType]);

  // Paginated samples
  const paginatedSamples = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSamples.slice(start, start + rowsPerPage);
  }, [filteredSamples, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const headerCellStyle = {
    py: 1.25,
    px: 1.5,
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: isDark ? '#94a3b8' : '#475569',
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.04em',
    bgcolor: headerBg,
  };

  const bodyCellStyle = {
    py: 0.75,
    px: 1.5,
    fontSize: '0.8rem',
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* 1. Filter and Action Toolbar matching PedigreeFilterBar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={1.5}
        >
          {/* Search input */}
          <TextField
            size="small"
            placeholder="Buscar por caravana, tubo o agente patógeno..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{
              flexGrow: 1,
              maxWidth: { md: 360 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                fontSize: '0.85rem',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FuseSvgIcon size={18} color="action">
                    heroicons-outline:magnifying-glass
                  </FuseSvgIcon>
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Pills + Quick Bulk Actions */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
            {/* Filter pills */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                p: 0.25,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
              }}
            >
              {FILTER_ITEMS.map((item) => {
                const isSelected = filterType === item.id;
                return (
                  <Button
                    key={item.id}
                    size="small"
                    onClick={() => {
                      setFilterType(item.id);
                      setPage(0);
                    }}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      textTransform: 'none',
                      borderRadius: '6px',
                      color: isSelected
                        ? activeColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : '#64748b',
                      bgcolor: isSelected
                        ? isDark
                          ? 'rgba(96, 165, 250, 0.15)'
                          : '#ffffff'
                        : 'transparent',
                      boxShadow: isSelected && !isDark ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      '&:hover': {
                        bgcolor: isSelected
                          ? isDark
                            ? 'rgba(96, 165, 250, 0.2)'
                            : '#ffffff'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#f1f5f9',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Bulk Action Buttons */}
            <Button
              size="small"
              variant="outlined"
              color="success"
              disabled={disabled || samples.length === 0}
              onClick={() => onApplyToAll('NEGATIVE_CLEARED')}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: '6px',
                px: 1.5,
              }}
            >
              Todos negativos
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={disabled || samples.length === 0}
              onClick={() => onApplyToAll('PENDING_RESULTS')}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.78rem',
                borderRadius: '6px',
                color: 'text.secondary',
                px: 1.5,
              }}
            >
              Limpiar
            </Button>

            {/* Resolved counter badge */}
            <Chip
              size="small"
              label={`${resolvedCount} de ${samples.length} calificados`}
              color={
                resolvedCount === samples.length && samples.length > 0
                  ? 'success'
                  : resolvedCount > 0
                  ? 'primary'
                  : 'default'
              }
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 28,
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* 2. Spreadsheet Table Container matching PedigreeDataTable */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          borderRadius: '6px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', minHeight: 320 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 800, borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: headerBg }}>
                <TableCell sx={{ ...headerCellStyle, width: 50, textAlign: 'center' }}>#</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Caravana / Animal</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>Agente Patógeno</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>N° Tubo</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 240, borderRight: 0 }}>
                  Resultado del Diagnóstico
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedSamples.map((sample, index) => {
                const globalIndex = page * rowsPerPage + index + 1;
                const isEven = index % 2 === 1;
                const sampleId = sample.id;
                const currentResult = results[sampleId] ?? 'PENDING_RESULTS';
                const caravan = sample.caravan_number ?? sample.caravan_id;

                return (
                  <TableRow
                    key={sample.id}
                    hover
                    sx={{
                      bgcolor: isEven ? zebraBg : 'transparent',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(10, 110, 209, 0.04)',
                      },
                    }}
                  >
                    {/* Index */}
                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>
                      {globalIndex}
                    </TableCell>

                    {/* Caravan */}
                    <TableCell sx={bodyCellStyle}>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'text.primary',
                          px: 1,
                          py: 0.35,
                          bgcolor: 'action.hover',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
                          display: 'inline-block',
                        }}
                      >
                        #{caravan}
                      </Box>
                    </TableCell>

                    {/* Pathogen */}
                    <TableCell sx={bodyCellStyle}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        {sample.pathogen_name ?? sample.pathogen_code ?? '—'}
                      </Typography>
                      {sample.pathogen_code && sample.pathogen_name && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}
                        >
                          {sample.pathogen_code}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Tube Number */}
                    <TableCell sx={bodyCellStyle}>
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                          color: sample.tube_number ? 'primary.main' : 'text.disabled',
                        }}
                      >
                        {sample.tube_number ?? '—'}
                      </Box>
                    </TableCell>

                    {/* Result Dropdown */}
                    <TableCell sx={{ ...bodyCellStyle, borderRight: 0 }}>
                      <Select
                        size="small"
                        value={currentResult}
                        disabled={disabled}
                        onChange={(e) =>
                          onResultChange(sampleId, e.target.value as LabSampleStatus)
                        }
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 34,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          bgcolor:
                            currentResult === 'NEGATIVE_CLEARED'
                              ? isDark
                                ? 'rgba(34, 197, 94, 0.16)'
                                : 'rgba(34, 197, 94, 0.1)'
                              : currentResult === 'POSITIVE_DETECTED'
                              ? isDark
                                ? 'rgba(239, 68, 68, 0.16)'
                                : 'rgba(239, 68, 68, 0.1)'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.05)'
                              : '#ffffff',
                          color:
                            currentResult === 'NEGATIVE_CLEARED'
                              ? 'success.main'
                              : currentResult === 'POSITIVE_DETECTED'
                              ? 'error.main'
                              : 'text.secondary',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor:
                              currentResult === 'NEGATIVE_CLEARED'
                                ? 'success.light'
                                : currentResult === 'POSITIVE_DETECTED'
                                ? 'error.light'
                                : isDark
                                ? 'rgba(255, 255, 255, 0.12)'
                                : '#cbd5e1',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor:
                              currentResult === 'NEGATIVE_CLEARED'
                                ? 'success.main'
                                : currentResult === 'POSITIVE_DETECTED'
                                ? 'error.main'
                                : 'primary.main',
                          },
                        }}
                      >
                        <MenuItem value="PENDING_RESULTS" sx={{ fontSize: '0.82rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'text.disabled',
                              }}
                            />
                            Sin resultado aún
                          </Box>
                        </MenuItem>
                        <MenuItem
                          value="NEGATIVE_CLEARED"
                          sx={{
                            fontSize: '0.82rem',
                            color: 'success.main',
                            fontWeight: 700,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                              }}
                            />
                            Negativo
                          </Box>
                        </MenuItem>
                        <MenuItem
                          value="POSITIVE_DETECTED"
                          sx={{
                            fontSize: '0.82rem',
                            color: 'error.main',
                            fontWeight: 700,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                              }}
                            />
                            Positivo
                          </Box>
                        </MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Empty state */}
              {paginatedSamples.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                      <FuseSvgIcon size={36} color="disabled">
                        heroicons-outline:magnifying-glass
                      </FuseSvgIcon>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      No se encontraron muestras en este protocolo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {searchTerm
                        ? 'Intente cambiar el término de búsqueda o seleccione otro filtro.'
                        : 'Esta acta no tiene muestras pendientes de resultado.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredSamples.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{
            borderTop: 1,
            borderColor: theme.palette.divider,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa',
          }}
        />
      </Paper>
    </Box>
  );
};

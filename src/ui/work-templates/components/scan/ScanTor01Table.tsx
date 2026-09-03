import React, { useState } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  TablePagination,
  Button,
  Stack,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { WorkTemplateScanRow } from './types';

interface ScanTor01TableProps {
  rows: WorkTemplateScanRow[];
  onRowChange: (index: number, field: keyof WorkTemplateScanRow, value: any) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onBulkScrape: () => void;
  onBulkSerology: () => void;
}

export const ScanTor01Table: React.FC<ScanTor01TableProps> = ({
  rows,
  onRowChange,
  onAddRow,
  onDeleteRow,
  onBulkScrape,
  onBulkSerology,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fcfcfd';

  const headerCellStyle = {
    fontWeight: 800,
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '2px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
    color: 'text.secondary',
    py: 1.2,
    px: 1,
  };

  return (
    <Box>
      {/* Quick Action Toolbar */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#ffffff',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 0.5 }}>
            Acciones Rápidas:
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ScienceIcon fontSize="small" />}
            onClick={onBulkScrape}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
              color: '#92400e',
              borderColor: '#f59e0b',
              bgcolor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
              '&:hover': { bgcolor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fde68a' },
            }}
          >
            ✓ Raspaje ETS a Todos
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<ScienceIcon fontSize="small" />}
            onClick={onBulkSerology}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
              color: '#1e40af',
              borderColor: '#3b82f6',
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
              '&:hover': { bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' },
            }}
          >
            ✓ Serología Sangre a Todos
          </Button>
        </Stack>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddIcon fontSize="small" />}
          onClick={onAddRow}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.75rem',
            borderRadius: '6px',
            bgcolor: '#0a6ed1',
            '&:hover': { bgcolor: '#0854a0' },
          }}
        >
          Agregar Toro (+)
        </Button>
      </Box>

      {/* Main Table Container */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1200, borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: headerBg }}>
              <TableCell sx={{ ...headerCellStyle, width: 45, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 140 }}>CARAVANA *</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 115, textAlign: 'center' }}>CE (CM)</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 95, textAlign: 'center' }}>CC (1-5)</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 120 }}>LÍBIDO</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 160 }}>APLOMOS</TableCell>
              <TableCell
                sx={{
                  ...headerCellStyle,
                  width: 170,
                  bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                  color: '#92400e',
                }}
              >
                RASPAJE ETS (TUBO)
              </TableCell>
              <TableCell
                sx={{
                  ...headerCellStyle,
                  width: 170,
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                  color: '#1e40af',
                }}
              >
                SEROLOGÍA (TUBO)
              </TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 130, textAlign: 'center' }}>DICTAMEN</TableCell>
              <TableCell sx={{ ...headerCellStyle }}>OBSERVACIONES</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 45, borderRight: 0 }}></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row, index) => {
              const globalIndex = page * rowsPerPage + index;
              const isZebra = globalIndex % 2 !== 0;
              const ceNum = row.ce_cm !== '' && row.ce_cm !== null ? Number(row.ce_cm) : null;
              const isCeLow = ceNum !== null && ceNum < 28.0;

              return (
                <TableRow
                  key={row.id || globalIndex}
                  hover
                  sx={{
                    bgcolor: isZebra ? zebraBg : 'background.paper',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                    },
                    '& td': {
                      borderBottom: '1px solid',
                      borderRight: '1px solid',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                      py: 0.6,
                      px: 0.8,
                    },
                  }}
                >
                  {/* 1. Index */}
                  <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>
                    {globalIndex + 1}
                  </TableCell>

                  {/* 2. Caravana */}
                  <TableCell>
                    <TextField
                      value={row.caravana}
                      onChange={(e) => onRowChange(globalIndex, 'caravana', e.target.value.toUpperCase())}
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="TR-001"
                      InputProps={{
                        sx: {
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          height: 34,
                          borderRadius: '4px',
                        },
                      }}
                    />
                  </TableCell>

                  {/* 3. Scrotal Circumference (CE cm) */}
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        value={row.ce_cm ?? ''}
                        onChange={(e) => onRowChange(globalIndex, 'ce_cm', e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="36.0"
                        inputProps={{ step: '0.5', min: '15', max: '60' }}
                        InputProps={{
                          sx: {
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            height: 34,
                            borderRadius: '4px',
                            color: isCeLow ? '#dc2626' : 'inherit',
                            bgcolor: isCeLow ? alpha('#dc2626', 0.08) : 'transparent',
                          },
                        }}
                      />
                      {isCeLow && (
                        <Tooltip title="Alerta: CE < 28 cm (Rechazo zootécnico según Carrillo)" arrow>
                          <WarningIcon
                            sx={{
                              color: '#dc2626',
                              fontSize: 16,
                              position: 'absolute',
                              right: 6,
                              pointerEvents: 'auto',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  {/* 4. Body Condition Score (CC 1-5) */}
                  <TableCell sx={{ textAlign: 'center' }}>
                    <TextField
                      type="number"
                      value={row.bcs ?? ''}
                      onChange={(e) => onRowChange(globalIndex, 'bcs', e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="3.5"
                      inputProps={{ step: '0.5', min: '1', max: '5' }}
                      InputProps={{
                        sx: {
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          height: 34,
                          borderRadius: '4px',
                        },
                      }}
                    />
                  </TableCell>

                  {/* 5. Líbido */}
                  <TableCell>
                    <TextField
                      select
                      value={row.libido || 'MEDIA'}
                      onChange={(e) => onRowChange(globalIndex, 'libido', e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputProps={{
                        sx: {
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          height: 34,
                          borderRadius: '4px',
                        },
                      }}
                    >
                      <MenuItem value="ALTA">Alta</MenuItem>
                      <MenuItem value="MEDIA">Media</MenuItem>
                      <MenuItem value="BAJA">Baja</MenuItem>
                      <MenuItem value="MUY_ALTA">Muy Alta</MenuItem>
                    </TextField>
                  </TableCell>

                  {/* 6. Aplomos */}
                  <TableCell>
                    <TextField
                      value={row.aplomos ?? ''}
                      onChange={(e) => onRowChange(globalIndex, 'aplomos', e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Correctos"
                      InputProps={{
                        sx: {
                          fontSize: '0.8rem',
                          height: 34,
                          borderRadius: '4px',
                        },
                      }}
                    />
                  </TableCell>

                  {/* 7. Raspaje ETS */}
                  <TableCell sx={{ bgcolor: isDark ? 'rgba(245, 158, 11, 0.04)' : '#fffdf5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={Boolean(row.scrape_collected)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onRowChange(globalIndex, 'scrape_collected', checked);
                          if (checked && !row.scrape_tube) {
                            onRowChange(globalIndex, 'scrape_tube', `R-${String(globalIndex + 1).padStart(2, '0')}`);
                          }
                        }}
                        sx={{ p: 0.5, color: '#d97706', '&.Mui-checked': { color: '#b45309' } }}
                      />
                      <TextField
                        value={row.scrape_tube ?? ''}
                        onChange={(e) => onRowChange(globalIndex, 'scrape_tube', e.target.value.toUpperCase())}
                        placeholder="R-01"
                        size="small"
                        disabled={!row.scrape_collected}
                        sx={{
                          flex: 1,
                          '& .MuiInputBase-root': {
                            height: 32,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  {/* 8. Serología Sangre */}
                  <TableCell sx={{ bgcolor: isDark ? 'rgba(59, 130, 246, 0.04)' : '#f8faff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={Boolean(row.serology_collected)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onRowChange(globalIndex, 'serology_collected', checked);
                          if (checked && !row.serology_tube) {
                            onRowChange(globalIndex, 'serology_tube', `S-${String(globalIndex + 1).padStart(2, '0')}`);
                          }
                        }}
                        sx={{ p: 0.5, color: '#2563eb', '&.Mui-checked': { color: '#1d4ed8' } }}
                      />
                      <TextField
                        value={row.serology_tube ?? ''}
                        onChange={(e) => onRowChange(globalIndex, 'serology_tube', e.target.value.toUpperCase())}
                        placeholder="S-01"
                        size="small"
                        disabled={!row.serology_collected}
                        sx={{
                          flex: 1,
                          '& .MuiInputBase-root': {
                            height: 32,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  {/* 9. Dictamen Físico */}
                  <TableCell sx={{ textAlign: 'center' }}>
                    <TextField
                      select
                      value={row.physical_verdict || 'A'}
                      onChange={(e) => onRowChange(globalIndex, 'physical_verdict', e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputProps={{
                        sx: {
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          height: 34,
                          borderRadius: '4px',
                          color:
                            row.physical_verdict === 'R'
                              ? '#dc2626'
                              : row.physical_verdict === 'T'
                              ? '#d97706'
                              : '#16a34a',
                        },
                      }}
                    >
                      <MenuItem value="A">Apto (A)</MenuItem>
                      <MenuItem value="R">Rechazo (R)</MenuItem>
                      <MenuItem value="T">Tratamiento (T)</MenuItem>
                    </TextField>
                  </TableCell>

                  {/* 10. Observaciones */}
                  <TableCell>
                    <TextField
                      value={row.observations ?? ''}
                      onChange={(e) => onRowChange(globalIndex, 'observations', e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Notas clínicas..."
                      InputProps={{
                        sx: {
                          fontSize: '0.8rem',
                          height: 34,
                          borderRadius: '4px',
                        },
                      }}
                    />
                  </TableCell>

                  {/* 11. Delete Row */}
                  <TableCell sx={{ textAlign: 'center', borderRight: 0 }}>
                    <Tooltip title="Eliminar fila">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteRow(globalIndex)}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No hay toros cargados en la grilla. Haz clic en "Agregar Toro (+)" o carga una simulación.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 15, 25, 50]}
        labelRowsPerPage="Toros por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        }}
      />
    </Box>
  );
};

export default ScanTor01Table;

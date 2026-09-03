import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Checkbox,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullHealthEvaluation, VeterinaryDiagnosis } from '@/core/pre-service/domain/BullHealthEvaluation';
import { PreServiceBullRow } from './PreServiceBullRow';

interface PreServiceBullTableProps {
  bulls: BullHealthEvaluation[];
  selectedBullIds: Set<number>;
  onToggleSelect: (caravanId: number) => void;
  onToggleSelectAll: (currentBatchIds: number[]) => void;
  onEvaluate: (bull: BullHealthEvaluation) => void;
  onResolveDiagnosis: (diag: VeterinaryDiagnosis) => void;
  onViewDiagnoses: (bull: BullHealthEvaluation) => void;
}

export const PreServiceBullTable: React.FC<PreServiceBullTableProps> = ({
  bulls,
  selectedBullIds,
  onToggleSelect,
  onToggleSelectAll,
  onEvaluate,
  onResolveDiagnosis,
  onViewDiagnoses,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const paginatedBulls = useMemo(() => {
    const from = page * rowsPerPage;
    return bulls.slice(from, from + rowsPerPage);
  }, [bulls, page, rowsPerPage]);

  const currentPageIds = useMemo(() => paginatedBulls.map((b) => b.caravan_id), [paginatedBulls]);

  const allCurrentSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedBullIds.has(id));
  const someCurrentSelected =
    currentPageIds.some((id) => selectedBullIds.has(id)) && !allCurrentSelected;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const headerCellStyle = {
    fontWeight: 800,
    fontSize: '0.72rem',
    color: 'text.secondary',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    py: 1.25,
    px: 1.5,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
  };

  if (bulls.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            mx: 'auto',
            mb: 2,
            borderRadius: '50%',
            bgcolor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
            color: isDark ? '#60a5fa' : '#0a6ed1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FuseSvgIcon size={26}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
          No se encontraron toros reproductores
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
          Ajusta los filtros de búsqueda o registra nuevos reproductores en el plantel.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 960, borderCollapse: 'collapse' }} size="small">
          <TableHead sx={{ bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>
            <TableRow>
              {/* Checkbox Header */}
              <TableCell
                padding="checkbox"
                sx={{
                  ...headerCellStyle,
                  pl: 2,
                  width: 48,
                }}
              >
                <Checkbox
                  size="small"
                  checked={allCurrentSelected}
                  indeterminate={someCurrentSelected}
                  onChange={() => onToggleSelectAll(currentPageIds)}
                  sx={{
                    color: isDark ? '#64748b' : '#94a3b8',
                    '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                      color: isDark ? '#60a5fa' : '#0a6ed1',
                    },
                  }}
                />
              </TableCell>

              <TableCell sx={headerCellStyle}>Caravana (Toro)</TableCell>
              <TableCell sx={headerCellStyle}>Estado de Aptitud</TableCell>
              <TableCell sx={headerCellStyle}>Biometría & Andrología</TableCell>
              <TableCell sx={headerCellStyle}>Aplomos & Locomoción</TableCell>
              <TableCell sx={headerCellStyle}>Muestreo Laboratorio (ETS / Sangre)</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 110, textAlign: 'center' }}>Diagnósticos</TableCell>
              <TableCell align="right" sx={{ ...headerCellStyle, width: 85, borderRight: 0 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedBulls.map((bull, idx) => (
              <PreServiceBullRow
                key={bull.caravan_id}
                bull={bull}
                index={page * rowsPerPage + idx}
                isSelected={selectedBullIds.has(bull.caravan_id)}
                onToggleSelect={onToggleSelect}
                onEvaluate={onEvaluate}
                onResolveDiagnosis={onResolveDiagnosis}
                onViewDiagnoses={onViewDiagnoses}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 15, 25, 50]}
        component="div"
        count={bulls.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        sx={{
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
        }}
      />
    </Paper>
  );
};

export default PreServiceBullTable;

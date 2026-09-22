import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { WeaningBatchFilterBar, WeaningBatchFilterStatus } from './WeaningBatchFilterBar';
import { WeaningBatchTableRow } from './WeaningBatchTableRow';

interface WeaningBatchDataTableProps {
  batches: Batch[];
  batchStatsMap: Map<number, { total: number; males: number; females: number }>;
  isLoading: boolean;
  onOpenCreateDialog: () => void;
  onViewCaravans: (batchId: number) => void;
  onOpenDetailDrawer: (batch: Batch) => void;
}

export const WeaningBatchDataTable: React.FC<WeaningBatchDataTableProps> = ({
  batches,
  batchStatsMap,
  isLoading,
  onOpenCreateDialog,
  onViewCaravans,
  onOpenDetailDrawer,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<WeaningBatchFilterStatus>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const headerBg = isDark ? '#1e293b' : '#f8fafc';

  // Counts for filter pills
  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let knowsToEat = 0;

    batches.forEach((b) => {
      if (b.isActive()) {
        active++;
      } else {
        inactive++;
      }
      if (b.knows_to_eat) {
        knowsToEat++;
      }
    });

    return {
      total: batches.length,
      active,
      inactive,
      knowsToEat,
    };
  }, [batches]);

  // Filter and Search Logic
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      // 1. Text Search
      const searchLower = searchTerm.toLowerCase().trim();
      if (searchLower) {
        const nameMatch = batch.name?.toLowerCase().includes(searchLower);
        const farmMatch = batch.farm_name?.toLowerCase().includes(searchLower);
        const obsMatch = batch.observaciones?.toLowerCase().includes(searchLower);

        if (!nameMatch && !farmMatch && !obsMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (filterStatus === 'ACTIVE' && !batch.isActive()) return false;
      if (filterStatus === 'INACTIVE' && batch.isActive()) return false;
      if (filterStatus === 'KNOWS_TO_EAT' && !batch.knows_to_eat) return false;

      return true;
    });
  }, [batches, searchTerm, filterStatus]);

  // Pagination
  const paginatedBatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBatches.slice(start, start + rowsPerPage);
  }, [filteredBatches, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const headerCellStyle = {
    fontWeight: 700,
    fontSize: '0.74rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'text.secondary',
    py: 1.25,
    px: 1.5,
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    whiteSpace: 'nowrap',
  };

  return (
    <Stack spacing={2}>
      {/* Search & Filter Bar */}
      <WeaningBatchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(0);
        }}
        filterStatus={filterStatus}
        onFilterChange={(status) => {
          setFilterStatus(status);
          setPage(0);
        }}
        totalCount={counts.total}
        activeCount={counts.active}
        inactiveCount={counts.inactive}
        knowsToEatCount={counts.knowsToEat}
        isDark={isDark}
      />

      {/* Loading State */}
      {isLoading ? (
        <Paper
          variant="outlined"
          sx={{
            p: 8,
            borderRadius: '8px',
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          }}
        >
          <CircularProgress size={36} sx={{ color: '#8b5cf6' }} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Cargando lotes de destete y parámetros zootécnicos...
          </Typography>
        </Paper>
      ) : filteredBatches.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            borderRadius: '8px',
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              bgcolor: isDark ? 'rgba(139, 92, 246, 0.12)' : '#f5f3ff',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FuseSvgIcon size={26}>heroicons-outline:clock</FuseSvgIcon>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
            No se encontraron lotes de destete
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
            {searchTerm || filterStatus !== 'ALL'
              ? 'No hay registros que coincidan con los filtros aplicados. Intenta restablecer la búsqueda.'
              : 'Aún no has registrado ningún lote de destete o desmadre para tu establecimiento.'}
          </Typography>
          {!searchTerm && filterStatus === 'ALL' && (
            <Button
              variant="contained"
              onClick={onOpenCreateDialog}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
              sx={{
                borderRadius: '6px',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
              }}
            >
              Crear Primer Lote de Destete
            </Button>
          )}
        </Paper>
      ) : (
        <Paper
          sx={{
            border: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <TableContainer>
            <Table size="small" sx={{ minWidth: 920, borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerBg }}>
                  <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 230 }}>Lote de Destete</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 90, textAlign: 'center' }}>Cabezas</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Distribución Sexos</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 155 }}>Peso Promedio</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 125, textAlign: 'center' }}>Batea / Ración</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 100, textAlign: 'center' }}>Edad Estimada</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 105, textAlign: 'center' }}>Fecha Creación</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 100, textAlign: 'center' }}>Estado</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 95, textAlign: 'center', borderRight: 0 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBatches.map((batch, index) => {
                  const stats = batchStatsMap.get(batch.id) || { total: 0, males: 0, females: 0 };

                  return (
                    <WeaningBatchTableRow
                      key={batch.id}
                      batch={batch}
                      index={page * rowsPerPage + index}
                      stats={stats}
                      onViewCaravans={onViewCaravans}
                      onOpenDetailDrawer={onOpenDetailDrawer}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredBatches.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 15, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            sx={{
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? '#1e293b' : '#ffffff',
            }}
          />
        </Paper>
      )}
    </Stack>
  );
};

export default WeaningBatchDataTable;

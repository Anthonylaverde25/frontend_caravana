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
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { ServiceBatchFilterBar, ServiceBatchFilterStatus } from './ServiceBatchFilterBar';
import { ServiceBatchTableRow } from './ServiceBatchTableRow';
import { TemporalWindowExplanationDialog } from '../dialogs/TemporalWindowExplanationDialog';

interface ServiceBatchDataTableProps {
  batches: Batch[];
  batchStatsMap: Map<number, { females: number; males: number; ratio: number }>;
  serviceOrdersMap: Map<number, ServiceOrder>;
  isLoading: boolean;
  onOpenWizard: () => void;
  onViewCaravans: (batchId: number) => void;
  onOpenDetailDrawer: (batch: Batch, order?: ServiceOrder) => void;
}

export const ServiceBatchDataTable: React.FC<ServiceBatchDataTableProps> = ({
  batches,
  batchStatsMap,
  serviceOrdersMap,
  isLoading,
  onOpenWizard,
  onViewCaravans,
  onOpenDetailDrawer,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ServiceBatchFilterStatus>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isTemporalInfoOpen, setIsTemporalInfoOpen] = useState(false);

  const headerBg = isDark ? '#1e293b' : '#f8fafc';

  // Counts for filter pills
  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let critical = 0;

    batches.forEach((b) => {
      if (b.isActive()) {
        active++;
        const stats = batchStatsMap.get(b.id);
        if (stats && stats.ratio < 2.0) {
          critical++;
        }
      } else {
        inactive++;
      }
    });

    return {
      total: batches.length,
      active,
      inactive,
      critical,
    };
  }, [batches, batchStatsMap]);

  // Filter and Search Logic
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      // 1. Text Search
      const searchLower = searchTerm.toLowerCase().trim();
      if (searchLower) {
        const nameMatch = batch.name?.toLowerCase().includes(searchLower);
        const orderMatch = serviceOrdersMap.get(batch.id)?.code?.toLowerCase().includes(searchLower);
        const femaleCatMatch = batch.service_detail?.female_category_name?.toLowerCase().includes(searchLower);
        const maleCatMatch = batch.service_detail?.male_category_name?.toLowerCase().includes(searchLower);

        if (!nameMatch && !orderMatch && !femaleCatMatch && !maleCatMatch) {
          return false;
        }
      }

      // 2. Status Filter
      const stats = batchStatsMap.get(batch.id) || { females: 0, males: 0, ratio: 0 };
      if (filterStatus === 'ACTIVE' && !batch.isActive()) return false;
      if (filterStatus === 'INACTIVE' && batch.isActive()) return false;
      if (filterStatus === 'CRITICAL_RATIO' && (!batch.isActive() || stats.ratio >= 2.0)) return false;

      return true;
    });
  }, [batches, searchTerm, filterStatus, batchStatsMap, serviceOrdersMap]);

  // Paginated Slicing
  const paginatedBatches = useMemo(() => {
    const from = page * rowsPerPage;
    return filteredBatches.slice(from, from + rowsPerPage);
  }, [filteredBatches, page, rowsPerPage]);

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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    py: 1.25,
    px: 1.5,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
  };

  return (
    <Stack spacing={2}>
      {/* Search and Filter Toolbar */}
      <ServiceBatchFilterBar
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
        criticalCount={counts.critical}
        isDark={isDark}
      />

      {/* Loading Skeleton / State */}
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
          <CircularProgress size={36} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Cargando lotes de servicio y métricas reproductivas...
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
              bgcolor: isDark ? 'rgba(236, 72, 153, 0.12)' : '#fdf2f8',
              color: isDark ? '#f472b6' : '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FuseSvgIcon size={26}>heroicons-outline:heart</FuseSvgIcon>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
            No se encontraron lotes de servicio
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
            {searchTerm || filterStatus !== 'ALL'
              ? 'No hay registros que coincidan con los filtros aplicados. Intenta restablecer la búsqueda.'
              : 'Aún no has registrado ningún lote de entore o servicio para tu establecimiento.'}
          </Typography>
          {!searchTerm && filterStatus === 'ALL' && (
            <Button
              variant="contained"
              color="primary"
              onClick={onOpenWizard}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
              sx={{ borderRadius: '6px', fontWeight: 700 }}
            >
              Crear Primer Lote de Servicio
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
            <Table size="small" sx={{ minWidth: 960, borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerBg }}>
                  <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>Lote de Servicio / Entore</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 145, textAlign: 'center' }}>Orden de Servicio</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Categoría Vientres</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Categoría Toros</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 85, textAlign: 'center' }}>Vientres</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 80, textAlign: 'center' }}>Toros</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 110, textAlign: 'center' }}>Ratio Torada</TableCell>
                  <TableCell sx={{ ...headerCellStyle, minWidth: 155 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <span>Ventana Temporal</span>
                      <Tooltip title="Ver fundamentación zootécnica de la ventana temporal (/livestock-tutor)" arrow>
                        <IconButton
                          size="small"
                          onClick={() => setIsTemporalInfoOpen(true)}
                          sx={{
                            p: 0.25,
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          <FuseSvgIcon size={15}>heroicons-outline:information-circle</FuseSvgIcon>
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 105, textAlign: 'center' }}>Estado</TableCell>
                  <TableCell sx={{ ...headerCellStyle, width: 85, textAlign: 'center', borderRight: 0 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBatches.map((batch, index) => {
                  const stats = batchStatsMap.get(batch.id) || { females: 0, males: 0, ratio: 0 };
                  const serviceOrder = serviceOrdersMap.get(batch.id);

                  return (
                    <ServiceBatchTableRow
                      key={batch.id}
                      batch={batch}
                      index={page * rowsPerPage + index}
                      stats={stats}
                      serviceOrder={serviceOrder}
                      onViewCaravans={onViewCaravans}
                      onOpenDetailDrawer={onOpenDetailDrawer}
                      onOpenTemporalInfo={() => setIsTemporalInfoOpen(true)}
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

      {/* Explanatory Modal Dialog */}
      <TemporalWindowExplanationDialog
        open={isTemporalInfoOpen}
        onClose={() => setIsTemporalInfoOpen(false)}
      />
    </Stack>
  );
};

export default ServiceBatchDataTable;

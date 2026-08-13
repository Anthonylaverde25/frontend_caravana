import { useState, useMemo } from 'react';
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
  Checkbox,
  TablePagination,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';
import PedigreeFilterBar, { FilterStatus } from './PedigreeFilterBar';
import PedigreeSelectionBanner from './PedigreeSelectionBanner';
import PedigreeTableRow from './PedigreeTableRow';

interface PedigreeDataTableProps {
  records: PedigreeRecord[];
  onFocusInTree: (caravanId: number) => void;
  onOpenMatingAdvisor: (record: PedigreeRecord) => void;
  onOpenRiskyCrosses: (caravanId: number) => void;
  onOpenIsolateDialog?: (records: PedigreeRecord[]) => void;
  onOpenRescueDialog?: (females: PedigreeRecord[]) => void;
}

export default function PedigreeDataTable({
  records,
  onFocusInTree,
  onOpenMatingAdvisor,
  onOpenRiskyCrosses,
  onOpenIsolateDialog,
  onOpenRescueDialog,
}: PedigreeDataTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedCaravanIds, setSelectedCaravanIds] = useState<number[]>([]);

  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search filter
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        r.identification.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.breed.toLowerCase().includes(q) ||
        r.batchName.toLowerCase().includes(q) ||
        (r.father && r.father.identification.toLowerCase().includes(q)) ||
        (r.mother && r.mother.identification.toLowerCase().includes(q)) ||
        (r.maternalGrandsire && r.maternalGrandsire.identification.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Status filter
      if (filterStatus === 'WITH_LINEAGE') {
        return r.father !== null || r.mother !== null;
      }
      if (filterStatus === 'DEEP_TREE') {
        return r.treeDepth >= 2;
      }
      if (filterStatus === 'INBREEDING_ALERT') {
        return r.inbreedingRisk === 'HIGH' || r.inbreedingRisk === 'CRITICAL' || r.inbreedingRisk === 'MODERATE';
      }
      if (filterStatus === 'OPTIMAL') {
        return r.inbreedingRisk === 'OPTIMAL';
      }

      return true;
    });
  }, [records, searchTerm, filterStatus]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, page, rowsPerPage]);

  const visibleIds = useMemo(() => paginatedRecords.map((r) => r.id), [paginatedRecords]);
  const allPageSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCaravanIds.includes(id));
  const somePageSelected = visibleIds.some((id) => selectedCaravanIds.includes(id)) && !allPageSelected;

  const handleSelectPage = () => {
    if (allPageSelected) {
      setSelectedCaravanIds(selectedCaravanIds.filter((id) => !visibleIds.includes(id)));
    } else {
      const set = new Set([...selectedCaravanIds, ...visibleIds]);
      setSelectedCaravanIds(Array.from(set));
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedCaravanIds.includes(id)) {
      setSelectedCaravanIds(selectedCaravanIds.filter((i) => i !== id));
    } else {
      setSelectedCaravanIds([...selectedCaravanIds, id]);
    }
  };

  const handleSelectAllCritical = () => {
    const criticals = records.filter((r) => r.inbreedingCoefficient > 12.5).map((r) => r.id);
    setSelectedCaravanIds(criticals);
  };

  const handleSelectAllAlerts = () => {
    const alerts = records.filter((r) => r.inbreedingCoefficient >= 6.25).map((r) => r.id);
    setSelectedCaravanIds(alerts);
  };

  const selectedRecordsList = useMemo(() => {
    const idSet = new Set(selectedCaravanIds);
    return records.filter((r) => idSet.has(r.id));
  }, [records, selectedCaravanIds]);

  const selectedFemalesList = useMemo(() => {
    return selectedRecordsList.filter((r) => r.sex === 'H');
  }, [selectedRecordsList]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    setPage(0);
  };

  const headerCellStyle = {
    py: 1.5,
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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filter Bar */}
      <PedigreeFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
        totalRecordsCount={records.length}
        onSelectAllCritical={handleSelectAllCritical}
        onSelectAllAlerts={handleSelectAllAlerts}
        isDark={isDark}
      />

      {/* Floating / Active Selection Banner */}
      <PedigreeSelectionBanner
        selectedCaravanIds={selectedCaravanIds}
        selectedRecordsList={selectedRecordsList}
        selectedFemalesList={selectedFemalesList}
        onOpenRescueDialog={onOpenRescueDialog}
        onOpenIsolateDialog={onOpenIsolateDialog}
        onClearSelection={() => setSelectedCaravanIds([])}
        isDark={isDark}
      />

      {/* Spreadsheet Table Container */}
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: theme.palette.divider,
          borderRadius: '4px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <TableContainer sx={{ maxHeight: 620 }}>
          <Table stickyHeader sx={{ minWidth: 1150, borderCollapse: 'collapse' }}>
            {/* Table Head */}
            <TableHead>
              <TableRow sx={{ bgcolor: headerBg }}>
                {/* 0. Selection Checkbox */}
                <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
                  <Checkbox
                    size="small"
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onChange={handleSelectPage}
                    sx={{ p: 0.5 }}
                  />
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>Caravana / Animal</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Lote</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Padre (Sire)</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Madre (Dam)</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Abuelo Paterno</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Abuelo Materno</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Nivel de Árbol</TableCell>
                <TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Consanguinidad ($F_X$)</TableCell>
                <TableCell sx={{ ...headerCellStyle, width: 65, textAlign: 'center' }}>Hijos</TableCell>
                <TableCell sx={{ ...headerCellStyle, width: 110, textAlign: 'center', borderRight: 0 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {paginatedRecords.map((r, index) => (
                <PedigreeTableRow
                  key={r.id}
                  r={r}
                  index={index}
                  isSelected={selectedCaravanIds.includes(r.id)}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onToggleSelect={handleToggleSelect}
                  onFocusInTree={onFocusInTree}
                  onOpenRiskyCrosses={onOpenRiskyCrosses}
                  onOpenMatingAdvisor={onOpenMatingAdvisor}
                  onOpenRescueDialog={onOpenRescueDialog}
                  isDark={isDark}
                  zebraBg={zebraBg}
                />
              ))}

              {paginatedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                      <FuseSvgIcon size={36} color="disabled">
                        heroicons-outline:magnifying-glass
                      </FuseSvgIcon>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      No se encontraron animales con los filtros seleccionados
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Intente cambiar el término de búsqueda o seleccione otro filtro rápido.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination Toolbar */}
        <TablePagination
          rowsPerPageOptions={[10, 15, 25, 50]}
          component="div"
          count={filteredRecords.length}
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
}

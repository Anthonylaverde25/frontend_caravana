import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
  simulateMating,
  MatingSimulationResult,
  PedigreeRecord,
} from '@/core/caravans/domain/services/pedigreeAnalysis';

interface RiskyCrossesReportDialogProps {
  open: boolean;
  onClose: () => void;
  caravans: Caravan[];
  onOpenMatingAdvisor: (damId?: number, sireId?: number) => void;
}

export interface RiskyCrossItem {
  dam: Caravan;
  sire: Caravan;
  simulation: MatingSimulationResult;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export default function RiskyCrossesReportDialog({
  open,
  onClose,
  caravans,
  onOpenMatingAdvisor,
}: RiskyCrossesReportDialogProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Map of caravan ID -> Caravan
  const caravansMap = useMemo(() => {
    const map = new Map<number, Caravan>();
    caravans.forEach((c) => map.set(c.id, c));
    return map;
  }, [caravans]);

  // Separate males and females
  const { males, females } = useMemo(() => {
    const m = caravans.filter((c) => c.sex === 'M');
    const f = caravans.filter((c) => c.sex === 'H');
    return { males: m, females: f };
  }, [caravans]);

  // Compute all potential risky crosses between herd males and females
  const allRiskyCrosses: RiskyCrossItem[] = useMemo(() => {
    if (males.length === 0 || females.length === 0) return [];

    const results: RiskyCrossItem[] = [];

    // Evaluate pair combinations
    for (const sire of males) {
      for (const dam of females) {
        // Skip self if same ID
        if (sire.id === dam.id) continue;

        const sim = simulateMating(dam.id, sire.id, caravansMap);

        // Only include crosses with inbreeding risk (Fx >= 3.125%)
        if (sim.projectedInbreeding >= 3.125) {
          let severity: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
          if (sim.projectedInbreeding >= 12.5) {
            severity = 'CRITICAL';
          } else if (sim.projectedInbreeding >= 6.25) {
            severity = 'HIGH';
          }

          results.push({
            dam,
            sire,
            simulation: sim,
            severity,
          });
        }
      }
    }

    // Sort descending by Fx (highest risk first)
    return results.sort((a, b) => b.simulation.projectedInbreeding - a.simulation.projectedInbreeding);
  }, [males, females, caravansMap]);

  // Filtered crosses
  const filteredCrosses = useMemo(() => {
    return allRiskyCrosses.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.sire.identification.toLowerCase().includes(q) ||
        item.dam.identification.toLowerCase().includes(q) ||
        (item.sire.breed && item.sire.breed.toLowerCase().includes(q)) ||
        (item.dam.breed && item.dam.breed.toLowerCase().includes(q)) ||
        item.simulation.commonAncestors.some((a) => a.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterSeverity === 'ALL') return true;
      return item.severity === filterSeverity;
    });
  }, [allRiskyCrosses, searchTerm, filterSeverity]);

  // Paginated records
  const paginatedCrosses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCrosses.slice(start, start + rowsPerPage);
  }, [filteredCrosses, page, rowsPerPage]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalRisky = allRiskyCrosses.length;
    const criticalCount = allRiskyCrosses.filter((c) => c.severity === 'CRITICAL').length;
    const highCount = allRiskyCrosses.filter((c) => c.severity === 'HIGH').length;
    const moderateCount = allRiskyCrosses.filter((c) => c.severity === 'MODERATE').length;

    // Find sire with most risky crosses
    const sireCountMap = new Map<number, number>();
    allRiskyCrosses.forEach((c) => {
      sireCountMap.set(c.sire.id, (sireCountMap.get(c.sire.id) || 0) + 1);
    });

    let topSireId: number | null = null;
    let maxSireCrosses = 0;
    sireCountMap.forEach((count, id) => {
      if (count > maxSireCrosses) {
        maxSireCrosses = count;
        topSireId = id;
      }
    });

    const topSire = topSireId ? caravansMap.get(topSireId) : null;

    return { totalRisky, criticalCount, highCount, moderateCount, topSire, maxSireCrosses };
  }, [allRiskyCrosses, caravansMap]);

  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      {/* Dialog Header */}
      <DialogTitle sx={{ pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'error.main', color: 'error.contrastText', width: 40, height: 40 }}>
            <FuseSvgIcon size={24}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Reporte de Análisis Genético: Cruzas Riesgosas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Auditoría preventiva de endogamia para evitar depresión endogámica en entores a campo e IATF
            </Typography>
          </Box>
        </Stack>

        <IconButton size="small" onClick={onClose}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* 1. Summary Metrics Banner */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {/* Card 1: Total Cruzas en Alerta */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                Cruzas en Riesgo
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
                {stats.totalRisky} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'gray' }}>combinaciones</span>
              </Typography>
            </Paper>

            {/* Card 2: Críticas (>12.5%) */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: stats.criticalCount > 0 ? alpha(theme.palette.error.main, 0.4) : 'divider',
                bgcolor: stats.criticalCount > 0 ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') : 'background.paper',
              }}
            >
              <Typography variant="caption" sx={{ color: stats.criticalCount > 0 ? 'error.main' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                🔴 Peligro Crítico (&gt;12.5%)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: stats.criticalCount > 0 ? 'error.main' : 'text.primary', mt: 0.5 }}>
                {stats.criticalCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'gray' }}>[Prohibidas]</span>
              </Typography>
            </Paper>

            {/* Card 3: Altas (6.25% - 12.5%) */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: stats.highCount > 0 ? alpha(theme.palette.warning.main, 0.4) : 'divider',
                bgcolor: stats.highCount > 0 ? (isDark ? 'rgba(245, 158, 11, 0.12)' : '#fff7ed') : 'background.paper',
              }}
            >
              <Typography variant="caption" sx={{ color: stats.highCount > 0 ? '#c2410c' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                🟠 Alerta Alta (6.25% - 12.5%)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: stats.highCount > 0 ? '#c2410c' : 'text.primary', mt: 0.5 }}>
                {stats.highCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'gray' }}>parejas</span>
              </Typography>
            </Paper>

            {/* Card 4: Toro con mayor emparentamiento */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                Toro con Mayor Riesgo
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5, fontFamily: 'monospace' }}>
                {stats.topSire ? `#${stats.topSire.identification}` : 'Ninguno'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {stats.topSire ? `${stats.maxSireCrosses} vientres emparentados` : 'Sin alertas'}
              </Typography>
            </Paper>
          </Box>

          {/* 2. Toolbar: Search & Severity Filters */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={2}
          >
            <TextField
              size="small"
              placeholder="Buscar por caravana de toro, vaca o ancestro común..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: { xs: '100%', md: 380 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={18} color="disabled">
                      heroicons-outline:magnifying-glass
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />

            {/* Severity Filter Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`Todas (${allRiskyCrosses.length})`}
                size="small"
                clickable
                color={filterSeverity === 'ALL' ? 'primary' : 'default'}
                variant={filterSeverity === 'ALL' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('ALL');
                  setPage(0);
                }}
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
              <Chip
                label={`🔴 Críticas (${stats.criticalCount})`}
                size="small"
                clickable
                color={filterSeverity === 'CRITICAL' ? 'error' : 'default'}
                variant={filterSeverity === 'CRITICAL' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('CRITICAL');
                  setPage(0);
                }}
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
              <Chip
                label={`🟠 Altas (${stats.highCount})`}
                size="small"
                clickable
                color={filterSeverity === 'HIGH' ? 'warning' : 'default'}
                variant={filterSeverity === 'HIGH' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('HIGH');
                  setPage(0);
                }}
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
              <Chip
                label={`🟡 Moderadas (${stats.moderateCount})`}
                size="small"
                clickable
                color={filterSeverity === 'MODERATE' ? 'warning' : 'default'}
                variant={filterSeverity === 'MODERATE' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('MODERATE');
                  setPage(0);
                }}
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Stack>
          </Stack>

          {/* 3. Risky Crosses DataTable */}
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
            <TableContainer sx={{ maxHeight: 460 }}>
              <Table stickyHeader sx={{ minWidth: 950, borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: headerBg }}>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider', width: 48, textAlign: 'center' }}>
                      #
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider', minWidth: 170 }}>
                      Reproductor (Toro ♂)
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider', minWidth: 170 }}>
                      Vientre (Vaca ♀)
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider', minWidth: 140 }}>
                      Consanguinidad ($F_X$)
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider', minWidth: 180 }}>
                      Ancestros Compartidos
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider', minWidth: 200 }}>
                      Dictamen Zootécnico
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', width: 90, textAlign: 'center' }}>
                      Acción
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedCrosses.map((item, idx) => {
                    const isCritical = item.severity === 'CRITICAL';
                    const isHigh = item.severity === 'HIGH';

                    const rowBg = isCritical
                      ? (isDark ? 'rgba(239, 68, 68, 0.18)' : '#fee2e2')
                      : isHigh
                      ? (isDark ? 'rgba(245, 158, 11, 0.14)' : '#ffedd5')
                      : (isDark ? 'rgba(245, 158, 11, 0.08)' : '#fef9c3');

                    return (
                      <TableRow
                        key={`${item.sire.id}-${item.dam.id}`}
                        hover
                        sx={{
                          bgcolor: rowBg,
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Index */}
                        <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', borderRight: 1, borderColor: 'divider' }}>
                          {page * rowsPerPage + idx + 1}
                        </TableCell>

                        {/* Sire (Toro) */}
                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 26, height: 26, bgcolor: 'info.light', color: 'info.contrastText', fontSize: '0.7rem', fontWeight: 800 }}>
                              ♂
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'info.dark', fontSize: '0.84rem' }}>
                                #{item.sire.identification}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
                                {item.sire.category || 'Toro'} • {item.sire.breed || 'Sin Raza'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Dam (Vaca) */}
                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 26, height: 26, bgcolor: 'secondary.light', color: 'secondary.contrastText', fontSize: '0.7rem', fontWeight: 800 }}>
                              ♀
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'secondary.dark', fontSize: '0.84rem' }}>
                                #{item.dam.identification}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
                                {item.dam.category || 'Vientre'} • {item.dam.breed || 'Sin Raza'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Fx */}
                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Chip
                            size="small"
                            label={`${item.simulation.projectedInbreeding}% — ${
                              isCritical ? 'CRÍTICO 🔴' : isHigh ? 'ALTO 🟠' : 'MODERADO 🟡'
                            }`}
                            sx={{
                              fontWeight: 900,
                              fontSize: '0.72rem',
                              bgcolor: isCritical ? '#ef4444' : isHigh ? '#ea580c' : '#ca8a04',
                              color: '#ffffff',
                            }}
                          />
                        </TableCell>

                        {/* Common Ancestors */}
                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {item.simulation.commonAncestors.map((anc, i) => (
                              <Chip
                                key={i}
                                size="small"
                                label={anc}
                                sx={{
                                  height: 20,
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              />
                            ))}
                          </Stack>
                        </TableCell>

                        {/* Agronomic Verdict */}
                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem', display: 'block', color: isCritical ? 'error.dark' : 'text.primary' }}>
                            {item.simulation.agronomicRecommendation.description}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="Abrir y simular apareamiento">
                            <Button
                              size="small"
                              variant="outlined"
                              color={isCritical ? 'error' : 'warning'}
                              onClick={() => {
                                onClose();
                                onOpenMatingAdvisor(item.dam.id, item.sire.id);
                              }}
                              sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.68rem', py: 0.2, px: 1 }}
                            >
                              Simular
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {paginatedCrosses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <FuseSvgIcon size={36} color="disabled">
                          heroicons-outline:check-badge
                        </FuseSvgIcon>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                          No se encontraron cruzas riesgosas con los filtros actuales
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Excelente: el rodeo no presenta combinaciones críticas bajo este criterio.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredCrosses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
              sx={{
                borderTop: 1,
                borderColor: theme.palette.divider,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa',
              }}
            />
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Metodología: Coeficiente de Consanguinidad de Wright ($F_X$) • Jorge Carrillo (*Manejo de un Rodeo de Cría*)
        </Typography>
        <Button variant="outlined" onClick={onClose} sx={{ fontWeight: 700 }}>
          Cerrar Reporte
        </Button>
      </DialogActions>
    </Dialog>
  );
}

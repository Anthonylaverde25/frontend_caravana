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
  Divider,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
  simulateMating,
  MatingSimulationResult,
} from '@/core/caravans/domain/services/pedigreeAnalysis';

interface CaravanRiskyCrossesDialogProps {
  open: boolean;
  onClose: () => void;
  caravan: Caravan | null;
  caravans: Caravan[];
  onOpenMatingAdvisor: (damId?: number, sireId?: number) => void;
}

interface SingleCaravanRiskyMatch {
  partner: Caravan;
  simulation: MatingSimulationResult;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export default function CaravanRiskyCrossesDialog({
  open,
  onClose,
  caravan,
  caravans,
  onOpenMatingAdvisor,
}: CaravanRiskyCrossesDialogProps) {
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

  const isMale = caravan?.sex === 'M';

  // Evaluate candidate opposite-sex partners for this specific caravan
  const candidatePartners = useMemo(() => {
    if (!caravan) return [];
    const targetSex = isMale ? 'H' : 'M';
    return caravans.filter((c) => c.id !== caravan.id && c.sex === targetSex);
  }, [caravan, caravans, isMale]);

  // Compute simulations against all candidate partners
  const { riskyMatches, safeCount, criticalCount, highCount, moderateCount } = useMemo(() => {
    if (!caravan || candidatePartners.length === 0) {
      return { riskyMatches: [], safeCount: 0, criticalCount: 0, highCount: 0, moderateCount: 0 };
    }

    const matches: SingleCaravanRiskyMatch[] = [];
    let safe = 0;
    let crit = 0;
    let high = 0;
    let mod = 0;

    candidatePartners.forEach((partner) => {
      const damId = isMale ? partner.id : caravan.id;
      const sireId = isMale ? caravan.id : partner.id;

      const sim = simulateMating(damId, sireId, caravansMap);

      if (sim.projectedInbreeding >= 3.125) {
        let severity: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
        if (sim.projectedInbreeding >= 12.5) {
          severity = 'CRITICAL';
          crit++;
        } else if (sim.projectedInbreeding >= 6.25) {
          severity = 'HIGH';
          high++;
        } else {
          mod++;
        }

        matches.push({
          partner,
          simulation: sim,
          severity,
        });
      } else {
        safe++;
      }
    });

    // Sort descending by Fx (highest risk first)
    matches.sort((a, b) => b.simulation.projectedInbreeding - a.simulation.projectedInbreeding);

    return {
      riskyMatches: matches,
      safeCount: safe,
      criticalCount: crit,
      highCount: high,
      moderateCount: mod,
    };
  }, [caravan, candidatePartners, isMale, caravansMap]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return riskyMatches.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.partner.identification.toLowerCase().includes(q) ||
        (item.partner.breed && item.partner.breed.toLowerCase().includes(q)) ||
        (item.partner.category && item.partner.category.toLowerCase().includes(q)) ||
        item.simulation.commonAncestors.some((a) => a.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterSeverity === 'ALL') return true;
      return item.severity === filterSeverity;
    });
  }, [riskyMatches, searchTerm, filterSeverity]);

  // Paginated records
  const paginatedMatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredMatches.slice(start, start + rowsPerPage);
  }, [filteredMatches, page, rowsPerPage]);

  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
  const headerCellStyle = {
    py: 1.2,
    px: 1.5,
    fontSize: '0.72rem',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: 'text.secondary',
    borderRight: 1,
    borderColor: 'divider',
    whiteSpace: 'nowrap' as const,
  };

  const bodyCellStyle = {
    py: 1,
    px: 1.5,
    fontSize: '0.78rem',
    borderRight: 1,
    borderColor: 'divider',
  };

  if (!caravan) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '6px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* 1. SAP Fiori Object Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          bgcolor: isDark ? 'background.paper' : '#fcfdfd',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: isMale ? '#0284c7' : '#db2777',
                color: '#ffffff',
                width: 44,
                height: 44,
                fontWeight: 900,
                fontSize: '1.2rem',
                borderRadius: '6px',
              }}
            >
              {isMale ? '♂' : '♀'}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Auditoría Genética Focalizada
                </Typography>
                <Chip
                  size="small"
                  label={isMale ? 'Reproductor ♂' : 'Vientre ♀'}
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: isMale ? 'info.light' : 'secondary.light',
                    color: isMale ? 'info.contrastText' : 'secondary.contrastText',
                  }}
                />
              </Stack>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 900, lineHeight: 1.2 }}>
                Caravana #{caravan.identification}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {caravan.category || 'Bovino'} • Raza: <strong>{caravan.breed || 'Sin Raza'}</strong> • Lote: General
              </Typography>
            </Box>
          </Stack>

          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
            <FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: isDark ? 'grey.950' : '#fafafa' }}>
        <Stack spacing={2.5}>
          {/* 2. SAP Fiori KPI Tiles Strip */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            {/* KPI 1: Evaluados */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                borderLeft: '4px solid',
                borderLeftColor: 'primary.main',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                {isMale ? 'Vientres Evaluados' : 'Toros Evaluados'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mt: 0.3 }}>
                {candidatePartners.length}
              </Typography>
            </Paper>

            {/* KPI 2: Cruces Seguros */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                borderLeft: '4px solid',
                borderLeftColor: '#22c55e',
              }}
            >
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Cruces Seguros (Exogamia)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#166534', mt: 0.3 }}>
                {safeCount}{' '}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'gray' }}>
                  ({Math.round((safeCount / (candidatePartners.length || 1)) * 100)}%)
                </span>
              </Typography>
            </Paper>

            {/* KPI 3: Cruces con Riesgo */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: riskyMatches.length > 0 ? alpha(theme.palette.error.main, 0.4) : 'divider',
                bgcolor: 'background.paper',
                borderLeft: '4px solid',
                borderLeftColor: riskyMatches.length > 0 ? '#ef4444' : '#94a3b8',
              }}
            >
              <Typography variant="caption" sx={{ color: riskyMatches.length > 0 ? 'error.main' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Cruces con Riesgo ($F_X &gt; 3.1\%$)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: riskyMatches.length > 0 ? 'error.main' : 'text.primary', mt: 0.3 }}>
                {riskyMatches.length}
              </Typography>
            </Paper>

            {/* KPI 4: Críticas */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: criticalCount > 0 ? alpha(theme.palette.error.main, 0.4) : 'divider',
                bgcolor: 'background.paper',
                borderLeft: '4px solid',
                borderLeftColor: criticalCount > 0 ? '#991b1b' : '#94a3b8',
              }}
            >
              <Typography variant="caption" sx={{ color: criticalCount > 0 ? '#991b1b' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Peligro Crítico ($F_X &gt; 12.5\%$)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: criticalCount > 0 ? '#991b1b' : 'text.primary', mt: 0.3 }}>
                {criticalCount} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'gray' }}>[Prohibidas]</span>
              </Typography>
            </Paper>
          </Box>

          {/* 3. Toolbar & Severity Filters */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={1.5}
          >
            <TextField
              size="small"
              placeholder={`Buscar por caravana de ${isMale ? 'vaca' : 'toro'} o ancestro común...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{
                minWidth: { xs: '100%', md: 360 },
                bgcolor: 'background.paper',
                borderRadius: '4px',
              }}
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

            {/* Severity Quick Filters */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`Todas (${riskyMatches.length})`}
                size="small"
                clickable
                color={filterSeverity === 'ALL' ? 'primary' : 'default'}
                variant={filterSeverity === 'ALL' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('ALL');
                  setPage(0);
                }}
                sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '4px' }}
              />
              <Chip
                label={`🔴 Críticas (${criticalCount})`}
                size="small"
                clickable
                color={filterSeverity === 'CRITICAL' ? 'error' : 'default'}
                variant={filterSeverity === 'CRITICAL' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('CRITICAL');
                  setPage(0);
                }}
                sx={{ fontWeight: 800, fontSize: '0.72rem', borderRadius: '4px' }}
              />
              <Chip
                label={`🟠 Altas (${highCount})`}
                size="small"
                clickable
                color={filterSeverity === 'HIGH' ? 'warning' : 'default'}
                variant={filterSeverity === 'HIGH' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('HIGH');
                  setPage(0);
                }}
                sx={{ fontWeight: 800, fontSize: '0.72rem', borderRadius: '4px' }}
              />
              <Chip
                label={`🟡 Moderadas (${moderateCount})`}
                size="small"
                clickable
                color={filterSeverity === 'MODERATE' ? 'warning' : 'default'}
                variant={filterSeverity === 'MODERATE' ? 'filled' : 'outlined'}
                onClick={() => {
                  setFilterSeverity('MODERATE');
                  setPage(0);
                }}
                sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '4px' }}
              />
            </Stack>
          </Stack>

          {/* 4. DataTable Container (Matching Project Spreadsheet Pattern) */}
          {riskyMatches.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '6px',
                border: '1.5px solid',
                borderColor: '#86efac',
                bgcolor: isDark ? 'rgba(34, 197, 94, 0.05)' : '#f0fdf4',
              }}
            >
              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: '#22c55e', width: 48, height: 48 }}>
                  <FuseSvgIcon size={26} color="inherit">heroicons-outline:check</FuseSvgIcon>
                </Avatar>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#166534' }}>
                ¡Excelente: Sin cruces riesgosos detectados!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mt: 0.5 }}>
                La caravana <strong>#{caravan.identification}</strong> no comparte linajes directos ni endogamia conocida con los{' '}
                <strong>{candidatePartners.length}</strong> {isMale ? 'vientres hembras' : 'reproductores machos'} del establecimiento.
              </Typography>
            </Paper>
          ) : (
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
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table stickyHeader sx={{ minWidth: 880, borderCollapse: 'collapse' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: headerBg }}>
                      <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                      <TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>
                        {isMale ? 'Vientre Emparentado (Vaca ♀)' : 'Reproductor Emparentado (Toro ♂)'}
                      </TableCell>
                      <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>
                        Consanguinidad ($F_X$)
                      </TableCell>
                      <TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>
                        Ancestros Compartidos
                      </TableCell>
                      <TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>
                        Dictamen Zootécnico
                      </TableCell>
                      <TableCell sx={{ ...headerCellStyle, width: 110, textAlign: 'center', borderRight: 0 }}>
                        Acción
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedMatches.map(({ partner, simulation, severity }, index) => {
                      const isCritical = severity === 'CRITICAL';
                      const isHigh = severity === 'HIGH';

                      const rowBg = isCritical
                        ? (isDark ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2')
                        : isHigh
                        ? (isDark ? 'rgba(245, 158, 11, 0.12)' : '#ffedd5')
                        : (isDark ? 'rgba(245, 158, 11, 0.08)' : '#fef9c3');

                      const rowHoverBg = isCritical
                        ? (isDark ? 'rgba(239, 68, 68, 0.24)' : '#fecaca')
                        : isHigh
                        ? (isDark ? 'rgba(245, 158, 11, 0.18)' : '#fed7aa')
                        : (isDark ? 'rgba(245, 158, 11, 0.14)' : '#fef08a');

                      return (
                        <TableRow
                          key={partner.id}
                          hover
                          sx={{
                            bgcolor: rowBg,
                            '&:hover': { bgcolor: rowHoverBg },
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          {/* 1. Index */}
                          <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>
                            {page * rowsPerPage + index + 1}
                          </TableCell>

                          {/* 2. Partner Identification */}
                          <TableCell sx={bodyCellStyle}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: isMale ? 'secondary.light' : 'info.light',
                                  color: isMale ? 'secondary.contrastText' : 'info.contrastText',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                }}
                              >
                                {isMale ? '♀' : '♂'}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'primary.main', fontSize: '0.84rem', lineHeight: 1.1 }}>
                                  #{partner.identification}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                                  {partner.category || 'Bovino'} • {partner.breed || 'Sin Raza'}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* 3. Inbreeding Fx */}
                          <TableCell sx={bodyCellStyle}>
                            <Chip
                              size="small"
                              label={`${simulation.projectedInbreeding}% — ${
                                isCritical ? 'Crítico 🔴' : isHigh ? 'Alto 🟠' : 'Moderado 🟡'
                              }`}
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                height: 22,
                                bgcolor: isCritical ? '#ef4444' : isHigh ? '#ea580c' : '#ca8a04',
                                color: '#ffffff',
                                borderRadius: '4px',
                              }}
                            />
                          </TableCell>

                          {/* 4. Common Ancestors */}
                          <TableCell sx={bodyCellStyle}>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {simulation.commonAncestors.map((anc, i) => (
                                <Chip
                                  key={i}
                                  size="small"
                                  label={anc}
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '3px',
                                  }}
                                />
                              ))}
                            </Stack>
                          </TableCell>

                          {/* 5. Agronomic Verdict */}
                          <TableCell sx={bodyCellStyle}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                display: 'block',
                                color: isCritical ? 'error.dark' : 'text.primary',
                                lineHeight: 1.3,
                              }}
                            >
                              {simulation.agronomicRecommendation.description}
                            </Typography>
                          </TableCell>

                          {/* 6. Action: Simulate */}
                          <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: 0 }}>
                            <Tooltip title="Abrir y simular apareamiento con esta pareja">
                              <Button
                                size="small"
                                variant="outlined"
                                color={isCritical ? 'error' : 'warning'}
                                startIcon={<FuseSvgIcon size={14}>heroicons-outline:sparkles</FuseSvgIcon>}
                                onClick={() => {
                                  onClose();
                                  if (isMale) {
                                    onOpenMatingAdvisor(partner.id, caravan.id);
                                  } else {
                                    onOpenMatingAdvisor(caravan.id, partner.id);
                                  }
                                }}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  py: 0.3,
                                  px: 1,
                                  borderRadius: '4px',
                                }}
                              >
                                Simular
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {paginatedMatches.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            No hay cruces que coincidan con la búsqueda o filtro seleccionado.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Native TablePagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredMatches.length}
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
          )}
        </Stack>
      </DialogContent>

      {/* 5. SAP Fiori Minimalist Dialog Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          justifyContent: 'space-between',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'background.paper' : '#ffffff',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Metodología: Coeficiente de Wright ($F_X$) • Jorge Carrillo (*Manejo de un Rodeo de Cría*, INTA Balcarce)
        </Typography>

        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: '4px',
            px: 2.5,
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

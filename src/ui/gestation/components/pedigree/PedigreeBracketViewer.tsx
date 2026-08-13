import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
  Drawer,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
  PedigreeRecord,
  analyzeCaravanInbreedingDetail,
  CaravanInbreedingDetail,
} from '@/core/caravans/domain/services/pedigreeAnalysis';

interface PedigreeBracketViewerProps {
  caravans: Caravan[];
  pedigreeRecords: PedigreeRecord[];
  initialSelectedId?: number | null;
  onOpenMatingAdvisor: (record?: PedigreeRecord) => void;
  onViewInGraph?: (caravanId: number) => void;
}

interface AncestorNodeData {
  caravan: Caravan | null;
  record: PedigreeRecord | null;
  role: string;
  isMale: boolean;
  isUnknown?: boolean;
}

export default function PedigreeBracketViewer({
  caravans,
  pedigreeRecords,
  initialSelectedId,
  onOpenMatingAdvisor,
  onViewInGraph,
}: PedigreeBracketViewerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Fast lookup maps
  const caravansMap = useMemo(() => {
    const map = new Map<number, Caravan>();
    caravans.forEach((c) => map.set(c.id, c));
    return map;
  }, [caravans]);

  const recordsMap = useMemo(() => {
    const map = new Map<number, PedigreeRecord>();
    pedigreeRecords.forEach((r) => map.set(r.id, r));
    return map;
  }, [pedigreeRecords]);

  // Caravans with pedigree connections for quick picker
  const eligibleCaravans = useMemo(() => {
    const withParents = caravans.filter((c) => c.lineage?.father_id != null || c.lineage?.mother_id != null);
    return withParents.length > 0 ? withParents : caravans;
  }, [caravans]);

  // Selected animal ID
  const [selectedId, setSelectedId] = useState<number>(() => {
    if (initialSelectedId && caravansMap.has(initialSelectedId)) return initialSelectedId;
    return eligibleCaravans.length > 0 ? eligibleCaravans[0].id : caravans[0]?.id || 0;
  });

  const selectedCaravan = caravansMap.get(selectedId) || caravans[0];
  const selectedRecord = selectedCaravan ? recordsMap.get(selectedCaravan.id) : null;

  // Selected ancestor to trace in the Aside Drawer
  const [traceAncestor, setTraceAncestor] = useState<Caravan | null>(null);

  // Orientation State: 'horizontal' | 'vertical'
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle fullscreen helper
  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Close fullscreen on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Detailed Inbreeding Breakdown
  const inbreedingDetail: CaravanInbreedingDetail = useMemo(() => {
    if (!selectedCaravan) {
      return {
        fx: 0,
        risk: 'OPTIMAL',
        riskLabel: '0.0% — Óptimo',
        isExogamous: true,
        commonAncestors: [],
        summaryExplanation: '',
        zootechnicalVerdict: {
          status: 'RECOMMENDED',
          title: '',
          description: '',
          fieldAction: '',
          bibliographicNote: '',
        },
      };
    }
    return analyzeCaravanInbreedingDetail(selectedCaravan, caravansMap);
  }, [selectedCaravan, caravansMap]);

  // Set of common ancestor IDs for visual tree highlighting
  const commonAncestorIds = useMemo(() => {
    return new Set(inbreedingDetail.commonAncestors.map((c) => c.ancestorId));
  }, [inbreedingDetail]);

  // Helper to extract an ancestor by ID
  const getAncestorData = (
    id: number | null | undefined,
    role: string,
    isMale: boolean
  ): AncestorNodeData => {
    if (!id) {
      return { caravan: null, record: null, role, isMale, isUnknown: true };
    }
    const c = caravansMap.get(id) || null;
    const r = c ? recordsMap.get(c.id) || null : null;
    return {
      caravan: c,
      record: r,
      role,
      isMale,
      isUnknown: !c,
    };
  };

  // Build the 3-generation ancestry hierarchy for selected animal
  const tree = useMemo(() => {
    if (!selectedCaravan) return null;

    // Gen 1: Parents
    const fatherId = selectedCaravan.lineage?.father_id;
    const motherId = selectedCaravan.lineage?.mother_id;
    const father = getAncestorData(fatherId, 'Padre (Toro ♂)', true);
    const mother = getAncestorData(motherId, 'Madre (Vaca ♀)', false);

    // Gen 2: Grandparents
    const pgsId = father.caravan?.lineage?.father_id;
    const pgdId = father.caravan?.lineage?.mother_id;
    const mgsId = mother.caravan?.lineage?.father_id;
    const mgdId = mother.caravan?.lineage?.mother_id;

    const pgs = getAncestorData(pgsId, 'Abuelo Pat. (PGS)', true);
    const pgd = getAncestorData(pgdId, 'Abuela Pat. (PGD)', false);
    const mgs = getAncestorData(mgsId, 'Abuelo Mat. (MGS)', true);
    const mgd = getAncestorData(mgdId, 'Abuela Mat. (MGD)', false);

    // Gen 3: Great-Grandparents
    const ppsId = pgs.caravan?.lineage?.father_id;
    const ppdId = pgs.caravan?.lineage?.mother_id;
    const pmsId = pgd.caravan?.lineage?.father_id;
    const pmdId = pgd.caravan?.lineage?.mother_id;

    const mpsId = mgs.caravan?.lineage?.father_id;
    const mpdId = mgs.caravan?.lineage?.mother_id;
    const mmsId = mgd.caravan?.lineage?.father_id;
    const mmdId = mgd.caravan?.lineage?.mother_id;

    return {
      individual: selectedCaravan,
      record: selectedRecord,
      father,
      mother,
      pgs,
      pgd,
      mgs,
      mgd,
      pps: getAncestorData(ppsId, 'Bisabuelo PP', true),
      ppd: getAncestorData(ppdId, 'Bisabuela PP', false),
      pms: getAncestorData(pmsId, 'Bisabuelo PM', true),
      pmd: getAncestorData(pmdId, 'Bisabuela PM', false),
      mps: getAncestorData(mpsId, 'Bisabuelo MP', true),
      mpd: getAncestorData(mpdId, 'Bisabuela MP', false),
      mms: getAncestorData(mmsId, 'Bisabuelo MM', true),
      mmd: getAncestorData(mmdId, 'Bisabuela MM', false),
    };
  }, [selectedCaravan, selectedRecord, caravansMap, recordsMap]);

  // Reconstruct step-by-step breadcrumb paths to the traced ancestor
  const tracePaths = useMemo(() => {
    if (!selectedCaravan || !traceAncestor) return { paternal: [], maternal: [] };

    const findPaths = (startId: number | null | undefined): Caravan[][] => {
      if (!startId) return [];
      const results: Caravan[][] = [];

      const search = (currentId: number, currentList: Caravan[], visited: Set<number>) => {
        if (visited.has(currentId)) return;
        const c = caravansMap.get(currentId);
        if (!c) return;

        const nextList = [...currentList, c];

        if (c.id === traceAncestor.id) {
          results.push(nextList);
          return;
        }

        const nextVisited = new Set(visited);
        nextVisited.add(currentId);

        if (c.lineage?.father_id) {
          search(c.lineage.father_id, nextList, nextVisited);
        }
        if (c.lineage?.mother_id) {
          search(c.lineage.mother_id, nextList, nextVisited);
        }
      };

      search(startId, [selectedCaravan], new Set());
      return results;
    };

    const paternal = findPaths(selectedCaravan.lineage?.father_id);
    const maternal = findPaths(selectedCaravan.lineage?.mother_id);

    return { paternal, maternal };
  }, [selectedCaravan, traceAncestor, caravansMap]);

  // Offspring of selected animal
  const offspringList = useMemo(() => {
    if (!selectedCaravan) return [];
    return caravans
      .filter((c) => c.lineage?.father_id === selectedCaravan.id || c.lineage?.mother_id === selectedCaravan.id)
      .map((c) => {
        const record = recordsMap.get(c.id);
        const mateId =
          c.lineage?.father_id === selectedCaravan.id ? c.lineage?.mother_id : c.lineage?.father_id;
        const mate = mateId ? caravansMap.get(mateId) : null;
        return {
          caravan: c,
          record,
          mate,
        };
      });
  }, [selectedCaravan, caravans, recordsMap, caravansMap]);

  // Navigation helpers
  const currentIndex = eligibleCaravans.findIndex((c) => c.id === selectedId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedId(eligibleCaravans[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < eligibleCaravans.length - 1) {
      setSelectedId(eligibleCaravans[currentIndex + 1].id);
    }
  };

  const handleRandom = () => {
    if (eligibleCaravans.length > 0) {
      const idx = Math.floor(Math.random() * eligibleCaravans.length);
      setSelectedId(eligibleCaravans[idx].id);
    }
  };

  // Render ancestor card taking minimum necessary width and height
  const renderBracketCard = (
    node: AncestorNodeData,
    options?: { isSelected?: boolean }
  ) => {
    const { caravan, role, isMale, isUnknown } = node;
    const isSelected = options?.isSelected;
    const isCommonAncestor = caravan ? commonAncestorIds.has(caravan.id) : false;

    if (isUnknown || !caravan) {
      return (
        <Paper
          elevation={0}
          sx={{
            px: 1.5,
            py: 1,
            width: 'fit-content',
            minWidth: 190,
            height: 'auto',
            minHeight: 'fit-content',
            boxSizing: 'border-box',
            border: '1.5px dashed',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
            borderRadius: '6px',
            bgcolor: isDark ? 'rgba(255,255,255,0.015)' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: 0.6,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', color: 'text.secondary', textTransform: 'uppercase' }}>
            {role}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.72rem', color: 'text.disabled', fontStyle: 'italic', mt: 0.2 }}>
            — Sin registro
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1,
          width: 'fit-content',
          minWidth: 200,
          maxWidth: '100%',
          height: 'auto',
          minHeight: 'fit-content',
          boxSizing: 'border-box',
          borderRadius: '6px',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          border: '1.5px solid',
          borderColor: isCommonAncestor
            ? '#ea580c'
            : isSelected
            ? 'primary.main'
            : isMale
            ? alpha('#0284c7', 0.5)
            : alpha('#db2777', 0.5),
          borderLeft: '4.5px solid',
          borderLeftColor: isCommonAncestor ? '#ea580c' : isMale ? '#0284c7' : '#db2777',
          boxShadow: isCommonAncestor
            ? `0 0 10px ${alpha('#ea580c', 0.35)}`
            : isSelected
            ? `0 0 12px ${alpha(theme.palette.primary.main, 0.4)}`
            : '0 2px 5px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.6,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            borderColor: isCommonAncestor ? '#ea580c' : isMale ? '#0284c7' : '#db2777',
          },
        }}
      >
        {/* Top Header inside Card */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.64rem',
              color: isCommonAncestor ? '#ea580c' : isMale ? '#0284c7' : '#db2777',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
            }}
          >
            {role}
          </Typography>
        </Stack>

        {/* Identification & Info */}
        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                bgcolor: isCommonAncestor ? '#ea580c' : isMale ? '#0284c7' : '#db2777',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 900,
                borderRadius: '4px',
              }}
            >
              {isMale ? '♂' : '♀'}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                #{caravan.identification}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', whiteSpace: 'nowrap' }}>
                {caravan.category || 'Bovino'} • {caravan.breed || 'Sin Raza'}
              </Typography>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.4} alignItems="center" sx={{ flexShrink: 0, ml: 1 }}>
            <Tooltip title={isCommonAncestor ? 'Ver Ruta de Repetición (¿Por qué causa consanguinidad?)' : 'Ver Ruta Genealógica'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setTraceAncestor(caravan);
                }}
                sx={{
                  p: 0.4,
                  border: '1px solid',
                  borderColor: isCommonAncestor ? '#fdba74' : 'divider',
                  bgcolor: isCommonAncestor ? '#fff7ed' : 'transparent',
                  color: isCommonAncestor ? '#ea580c' : 'text.secondary',
                  borderRadius: '4px',
                  '&:hover': { bgcolor: isCommonAncestor ? '#ffedd5' : 'action.hover' },
                }}
              >
                <FuseSvgIcon size={15}>heroicons-outline:map</FuseSvgIcon>
              </IconButton>
            </Tooltip>

            <Tooltip title="Centrar Árbol en este animal">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(caravan.id);
                }}
                sx={{
                  p: 0.4,
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'primary.main',
                  borderRadius: '4px',
                  '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                }}
              >
                <FuseSvgIcon size={15}>heroicons-outline:arrows-pointing-in</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  if (!selectedCaravan || !tree) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay animales disponibles para visualizar en el árbol.
        </Typography>
      </Box>
    );
  }

  const isMaleSelected = selectedCaravan.sex === 'M';

  // SVG Connector Fork Helper (Horizontal)
  const renderConnectorForkHorizontal = (color: string) => (
    <Box
      sx={{
        width: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
        minHeight: 60,
      }}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
        }}
      >
        <line x1="0" y1="50%" x2="50%" y2="50%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50%" y1="25%" x2="50%" y2="75%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50%" y1="25%" x2="100%" y2="25%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50%" y1="75%" x2="100%" y2="75%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </Box>
  );

  // SVG Connector Fork Helper (Vertical)
  const renderConnectorForkVertical = (color: string) => (
    <Box
      sx={{
        height: 32,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
        }}
      >
        <line x1="50%" y1="0" x2="50%" y2="50%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="25%" y1="50%" x2="75%" y2="50%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="25%" y1="50%" x2="25%" y2="100%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="75%" y1="50%" x2="75%" y2="100%" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </Box>
  );

  return (
    <Box
      ref={containerRef}
      sx={
        isFullscreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1300,
              bgcolor: isDark ? 'background.default' : '#f8fafc',
              p: 3,
              overflow: 'auto',
            }
          : { width: '100%' }
      }
    >
      {/* 1. TOP TOOLBAR: Quick Animal Picker & Controls */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: '6px',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          {/* Autocomplete Search */}
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 360 } }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                mb: 0.5,
                color: 'text.secondary',
                display: 'block',
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                letterSpacing: '0.5px',
              }}
            >
              Seleccionar Animal a Evaluar
            </Typography>
            <Autocomplete
              size="small"
              options={eligibleCaravans}
              value={selectedCaravan}
              onChange={(_, val) => val && setSelectedId(val.id)}
              getOptionLabel={(option) =>
                `#${option.identification} — ${option.category || 'Bovino'} (${option.breed || 'Sin Raza'}) [${
                  option.sex === 'M' ? 'Macho ♂' : 'Hembra ♀'
                }]`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar caravana por número o raza..."
                />
              )}
            />
          </Box>

          {/* View Controls & Navigation */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {/* Orientation Toggle */}
            <ToggleButtonGroup
              size="small"
              value={orientation}
              exclusive
              onChange={(_, next) => next && setOrientation(next)}
              sx={{ height: 32 }}
            >
              <ToggleButton value="horizontal" sx={{ px: 1.2, fontWeight: 800, fontSize: '0.72rem', textTransform: 'none' }}>
                <FuseSvgIcon size={16} className="mr-1">heroicons-outline:arrows-right-left</FuseSvgIcon>
                Horizontal
              </ToggleButton>
              <ToggleButton value="vertical" sx={{ px: 1.2, fontWeight: 800, fontSize: '0.72rem', textTransform: 'none' }}>
                <FuseSvgIcon size={16} className="mr-1">heroicons-outline:arrows-up-down</FuseSvgIcon>
                Vertical
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Fullscreen Button */}
            <Tooltip title={isFullscreen ? 'Salir de Pantalla Completa (ESC)' : 'Ver Árbol en Pantalla Completa'}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleToggleFullscreen}
                startIcon={<FuseSvgIcon size={16}>{isFullscreen ? 'heroicons-outline:arrows-pointing-in' : 'heroicons-outline:arrows-pointing-out'}</FuseSvgIcon>}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px', height: 32 }}
              >
                {isFullscreen ? 'Salir' : 'Pantalla Completa'}
              </Button>
            </Tooltip>

            {/* Navigation Buttons */}
            <Tooltip title="Animal anterior">
              <span>
                <IconButton
                  size="small"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', height: 32, width: 32 }}
                >
                  <FuseSvgIcon size={18}>heroicons-outline:chevron-left</FuseSvgIcon>
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Animal siguiente">
              <span>
                <IconButton
                  size="small"
                  onClick={handleNext}
                  disabled={currentIndex >= eligibleCaravans.length - 1}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', height: 32, width: 32 }}
                >
                  <FuseSvgIcon size={18}>heroicons-outline:chevron-right</FuseSvgIcon>
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Seleccionar animal con linaje al azar">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
                onClick={handleRandom}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px', height: 32 }}
              >
                Aleatorio
              </Button>
            </Tooltip>

            {onViewInGraph && (
              <Tooltip title="Ver en el explorador de grafos completo">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:share</FuseSvgIcon>}
                  onClick={() => onViewInGraph(selectedCaravan.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px', height: 32 }}
                >
                  Grafo
                </Button>
              </Tooltip>
            )}

            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>}
              onClick={() => onOpenMatingAdvisor(selectedRecord || undefined)}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '4px', boxShadow: 'none', height: 32 }}
            >
              Simular Cruza
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 2. EXECUTIVE FIELD DIAGNOSTIC BANNER */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: '6px',
          border: '1.5px solid',
          borderColor:
            inbreedingDetail.risk === 'CRITICAL'
              ? '#ef4444'
              : inbreedingDetail.risk === 'HIGH'
              ? '#ea580c'
              : inbreedingDetail.risk === 'MODERATE'
              ? '#ca8a04'
              : '#22c55e',
          bgcolor:
            inbreedingDetail.risk === 'CRITICAL'
              ? (isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2')
              : inbreedingDetail.risk === 'HIGH'
              ? (isDark ? 'rgba(234, 88, 12, 0.12)' : '#fff7ed')
              : inbreedingDetail.risk === 'MODERATE'
              ? (isDark ? 'rgba(202, 138, 4, 0.10)' : '#fefce8')
              : (isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4'),
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor:
                  inbreedingDetail.risk === 'CRITICAL'
                    ? '#ef4444'
                    : inbreedingDetail.risk === 'HIGH'
                    ? '#ea580c'
                    : inbreedingDetail.risk === 'MODERATE'
                    ? '#ca8a04'
                    : '#22c55e',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.4rem',
                borderRadius: '6px',
              }}
            >
              {isMaleSelected ? '♂' : '♀'}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 900 }}>
                  Caravana #{selectedCaravan.identification}
                </Typography>
                <Chip
                  size="small"
                  label={inbreedingDetail.riskLabel}
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.68rem',
                    bgcolor:
                      inbreedingDetail.risk === 'CRITICAL'
                        ? '#ef4444'
                        : inbreedingDetail.risk === 'HIGH'
                        ? '#ea580c'
                        : inbreedingDetail.risk === 'MODERATE'
                        ? '#ca8a04'
                        : '#22c55e',
                    color: '#ffffff',
                    borderRadius: '4px',
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3, fontWeight: 500 }}>
                {inbreedingDetail.summaryExplanation}
              </Typography>
            </Box>
          </Stack>

          {/* Action Callout */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '4px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? 'background.paper' : '#ffffff',
              minWidth: 260,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'block', fontSize: '0.62rem' }}>
              Dictamen de Manejo:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: inbreedingDetail.risk === 'CRITICAL' || inbreedingDetail.risk === 'HIGH' ? 'error.main' : 'success.main',
                mt: 0.2,
                fontSize: '0.8rem',
              }}
            >
              {inbreedingDetail.zootechnicalVerdict.fieldAction}
            </Typography>
          </Paper>
        </Stack>
      </Paper>

      {/* 3. THE TREE RENDERER: COMPACT FIT-CONTENT CONTAINERS */}
      <Box sx={{ p: 1, mb: 3, overflowX: 'auto' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FuseSvgIcon size={18}>heroicons-outline:academic-cap</FuseSvgIcon>
            Árbol Genealógico Completo ({orientation === 'horizontal' ? 'Vista Horizontal' : 'Vista Vertical'})
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 3, bgcolor: '#0284c7', borderRadius: '1px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#0284c7' }}>
                Línea Paterna ♂
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 3, bgcolor: '#db2777', borderRadius: '1px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#db2777' }}>
                Línea Materna ♀
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 3, bgcolor: '#ea580c', borderRadius: '1px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#ea580c' }}>
                ⭐️ Ancestro Común
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* ========================================================================= */}
        {/* OPTION A: HORIZONTAL VIEW (LEFT TO RIGHT) - FIT-CONTENT                   */}
        {/* ========================================================================= */}
        {orientation === 'horizontal' && (
          <Box sx={{ width: 'fit-content', minWidth: '100%' }}>
            {/* Header row with Generation names */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'max-content 32px max-content 32px max-content 32px max-content',
                mb: 1.5,
                textAlign: 'center',
                gap: 0,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                Individuo Evaluado
              </Typography>
              <Box />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                Padres (1ª Gen)
              </Typography>
              <Box />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                4 Abuelos (2ª Gen)
              </Typography>
              <Box />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                8 Bisabuelos (3ª Gen)
              </Typography>
            </Box>

            {/* Connected Grid fitting exactly content */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'max-content 32px max-content 32px max-content 32px max-content',
                alignItems: 'stretch',
                width: 'fit-content',
              }}
            >
              {/* COL 0: Evaluated Animal */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1.2,
                    width: 'fit-content',
                    minWidth: 210,
                    borderRadius: '6px',
                    bgcolor: isDark ? '#1e293b' : '#ffffff',
                    border: '2px solid',
                    borderColor: isMaleSelected ? '#0284c7' : '#db2777',
                    borderLeft: '5px solid',
                    borderLeftColor: isMaleSelected ? '#0284c7' : '#db2777',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.64rem', color: isMaleSelected ? '#0284c7' : '#db2777', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Animal Seleccionado (100%)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.6 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: isMaleSelected ? '#0284c7' : '#db2777', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem', borderRadius: '4px', flexShrink: 0 }}>
                      {isMaleSelected ? '♂' : '♀'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                        #{selectedCaravan.identification}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', whiteSpace: 'nowrap' }}>
                        {selectedCaravan.category || 'Bovino'} • {selectedCaravan.breed || 'Sin Raza'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Fx: ${inbreedingDetail.fx}% (${inbreedingDetail.risk})`}
                    sx={{
                      mt: 1,
                      width: '100%',
                      height: 20,
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      bgcolor: inbreedingDetail.risk === 'CRITICAL' ? '#ef4444' : inbreedingDetail.risk === 'HIGH' ? '#ea580c' : inbreedingDetail.risk === 'MODERATE' ? '#ca8a04' : '#22c55e',
                      color: '#ffffff',
                    }}
                  />
                </Paper>
              </Box>

              {/* Connector 0 -> 1 */}
              {renderConnectorForkHorizontal(isMaleSelected ? '#0284c7' : '#db2777')}

              {/* COL 1: Parents */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2.5 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {renderBracketCard(tree.father)}
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {renderBracketCard(tree.mother)}
                </Box>
              </Box>

              {/* Connector 1 -> 2 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {renderConnectorForkHorizontal('#0284c7')}
                {renderConnectorForkHorizontal('#db2777')}
              </Box>

              {/* COL 2: 4 Grandparents */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
                {renderBracketCard(tree.pgs)}
                {renderBracketCard(tree.pgd)}
                {renderBracketCard(tree.mgs)}
                {renderBracketCard(tree.mgd)}
              </Box>

              {/* Connector 2 -> 3 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {renderConnectorForkHorizontal('#0284c7')}
                {renderConnectorForkHorizontal('#0284c7')}
                {renderConnectorForkHorizontal('#db2777')}
                {renderConnectorForkHorizontal('#db2777')}
              </Box>

              {/* COL 3: 8 Great-Grandparents */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0.8 }}>
                {renderBracketCard(tree.pps)}
                {renderBracketCard(tree.ppd)}
                {renderBracketCard(tree.pms)}
                {renderBracketCard(tree.pmd)}
                {renderBracketCard(tree.mps)}
                {renderBracketCard(tree.mpd)}
                {renderBracketCard(tree.mms)}
                {renderBracketCard(tree.mmd)}
              </Box>
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* OPTION B: VERTICAL VIEW (TOP TO BOTTOM) - FIT-CONTENT                     */}
        {/* ========================================================================= */}
        {orientation === 'vertical' && (
          <Box sx={{ width: 'fit-content', minWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            {/* Level 0: Evaluated Animal */}
            <Box sx={{ width: 'fit-content' }}>
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1.2,
                  width: 'fit-content',
                  borderRadius: '6px',
                  bgcolor: isDark ? '#1e293b' : '#ffffff',
                  border: '2px solid',
                  borderColor: isMaleSelected ? '#0284c7' : '#db2777',
                  borderTop: '5px solid',
                  borderTopColor: isMaleSelected ? '#0284c7' : '#db2777',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.64rem', color: isMaleSelected ? '#0284c7' : '#db2777', textTransform: 'uppercase' }}>
                  Individuo Evaluado (100%)
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 0.6 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: isMaleSelected ? '#0284c7' : '#db2777', color: '#ffffff', fontWeight: 900 }}>
                    {isMaleSelected ? '♂' : '♀'}
                  </Avatar>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                      #{selectedCaravan.identification}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                      {selectedCaravan.category || 'Bovino'} • {selectedCaravan.breed || 'Sin Raza'}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  size="small"
                  label={`Fx: ${inbreedingDetail.fx}% (${inbreedingDetail.risk})`}
                  sx={{
                    mt: 1,
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    bgcolor: inbreedingDetail.risk === 'CRITICAL' ? '#ef4444' : inbreedingDetail.risk === 'HIGH' ? '#ea580c' : inbreedingDetail.risk === 'MODERATE' ? '#ca8a04' : '#22c55e',
                    color: '#ffffff',
                  }}
                />
              </Paper>
            </Box>

            {/* Vertical Fork Connector: 0 -> 1 */}
            <Box sx={{ width: 500 }}>{renderConnectorForkVertical(isMaleSelected ? '#0284c7' : '#db2777')}</Box>

            {/* Level 1: Parents (2 columns) */}
            <Stack direction="row" spacing={4} justifyContent="center">
              {renderBracketCard(tree.father)}
              {renderBracketCard(tree.mother)}
            </Stack>

            {/* Vertical Fork Connector: 1 -> 2 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 4, justifyContent: 'center' }}>
              <Box sx={{ width: 240 }}>{renderConnectorForkVertical('#0284c7')}</Box>
              <Box sx={{ width: 240 }}>{renderConnectorForkVertical('#db2777')}</Box>
            </Box>

            {/* Level 2: 4 Grandparents */}
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              {renderBracketCard(tree.pgs)}
              {renderBracketCard(tree.pgd)}
              {renderBracketCard(tree.mgs)}
              {renderBracketCard(tree.mgd)}
            </Stack>

            {/* Vertical Fork Connector: 2 -> 3 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 2, justifyContent: 'center' }}>
              <Box sx={{ width: 200 }}>{renderConnectorForkVertical('#0284c7')}</Box>
              <Box sx={{ width: 200 }}>{renderConnectorForkVertical('#0284c7')}</Box>
              <Box sx={{ width: 200 }}>{renderConnectorForkVertical('#db2777')}</Box>
              <Box sx={{ width: 200 }}>{renderConnectorForkVertical('#db2777')}</Box>
            </Box>

            {/* Level 3: 8 Great-Grandparents */}
            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
              {renderBracketCard(tree.pps)}
              {renderBracketCard(tree.ppd)}
              {renderBracketCard(tree.pms)}
              {renderBracketCard(tree.pmd)}
              {renderBracketCard(tree.mps)}
              {renderBracketCard(tree.mpd)}
              {renderBracketCard(tree.mms)}
              {renderBracketCard(tree.mmd)}
            </Stack>
          </Box>
        )}
      </Box>

      {/* 4. EDUCATIONAL FIELD GUIDE: "ESCALA DE CONSANGUINIDAD" */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          mb: 2.5,
          borderRadius: '6px',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 900,
            mb: 2,
            textTransform: 'uppercase',
            fontSize: '0.76rem',
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FuseSvgIcon size={18}>heroicons-outline:book-open</FuseSvgIcon>
          Guía de Campo: ¿Qué significa cada Nivel de Consanguinidad ($F_X$)?
        </Typography>

        {/* 4 Educational Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Level 1 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '6px',
              border: '1.5px solid',
              borderColor: inbreedingDetail.fx <= 3.125 ? '#22c55e' : 'divider',
              borderTop: '4px solid #22c55e',
              bgcolor: inbreedingDetail.fx <= 3.125 ? (isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4') : 'background.paper',
            }}
          >
            <Chip size="small" label="0% – 3.1%" sx={{ fontWeight: 900, bgcolor: '#dcfce7', color: '#166534', height: 20, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
              🟢 Exogamia Óptima
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
              <strong>Sin parentesco cercano.</strong> Máximo vigor híbrido (heterosis). Terneros con peso superior al destete y vacas con alta fertilidad.
            </Typography>
          </Paper>

          {/* Level 2 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '6px',
              border: '1.5px solid',
              borderColor: inbreedingDetail.fx > 3.125 && inbreedingDetail.fx <= 6.25 ? '#ca8a04' : 'divider',
              borderTop: '4px solid #ca8a04',
              bgcolor: inbreedingDetail.fx > 3.125 && inbreedingDetail.fx <= 6.25 ? (isDark ? 'rgba(202, 138, 4, 0.10)' : '#fefce8') : 'background.paper',
            }}
          >
            <Chip size="small" label="3.1% – 6.25%" sx={{ fontWeight: 900, bgcolor: '#fef9c3', color: '#854d0e', height: 20, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#854d0e' }}>
              🟡 Moderado (Primos)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
              <strong>Parentesco de primos hermanos.</strong> Aceptable para rodeo general de carne. Precaución si se retienen vaquillonas de reposición.
            </Typography>
          </Paper>

          {/* Level 3 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '6px',
              border: '1.5px solid',
              borderColor: inbreedingDetail.fx > 6.25 && inbreedingDetail.fx <= 12.5 ? '#ea580c' : 'divider',
              borderTop: '4px solid #ea580c',
              bgcolor: inbreedingDetail.fx > 6.25 && inbreedingDetail.fx <= 12.5 ? (isDark ? 'rgba(234, 88, 12, 0.10)' : '#fff7ed') : 'background.paper',
            }}
          >
            <Chip size="small" label="6.25% – 12.5%" sx={{ fontWeight: 900, bgcolor: '#ffedd5', color: '#c2410c', height: 20, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#c2410c' }}>
              🟠 Alerta (Medio Hermanos)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
              <strong>Mismo padre o madre.</strong> Comienza la depresión endogámica: merma de 5 a 10 kg al destete y mayor mortalidad embrionaria.
            </Typography>
          </Paper>

          {/* Level 4 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '6px',
              border: '1.5px solid',
              borderColor: inbreedingDetail.fx > 12.5 ? '#ef4444' : 'divider',
              borderTop: '4px solid #ef4444',
              bgcolor: inbreedingDetail.fx > 12.5 ? (isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2') : 'background.paper',
            }}
          >
            <Chip size="small" label="> 12.5% (Crítico)" sx={{ fontWeight: 900, bgcolor: '#fee2e2', color: '#991b1b', height: 20, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>
              🔴 Peligro (Padre x Hija)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
              <strong>Endogamia severa.</strong> Fijación de taras genéticas recesivas y caída drástica de fertilidad. <u>Prohibido para reproducción</u>.
            </Typography>
          </Paper>
        </Box>

        {/* 4.2 Breakdown of Common Ancestors */}
        {inbreedingDetail.commonAncestors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary' }}>
              Desglose de Repeticiones: ¿Qué ancestros comunes causaron este {inbreedingDetail.fx}% de endogamia?
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '4px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>
                      Ancestro Repetido
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>
                      Por la Línea del Padre (Toro ♂)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>
                      Por la Línea de la Madre (Vaca ♀)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider', minWidth: 140 }}>
                      Puntos Sumados
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', width: 90, textAlign: 'center' }}>
                      Ruta Visual
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inbreedingDetail.commonAncestors.map((ca) => {
                    const caObj = caravansMap.get(ca.ancestorId);
                    return (
                      <TableRow key={ca.ancestorId} hover>
                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: ca.sex === 'M' ? '#0284c7' : '#db2777',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                              }}
                            >
                              {ca.sex === 'M' ? '♂' : '♀'}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.82rem' }}>
                                #{ca.identification}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                {ca.category || 'Bovino'} • {ca.breed || 'Sin Raza'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Chip
                            size="small"
                            label={ca.paternalDesc}
                            sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#0284c7', 0.1), color: '#0284c7' }}
                          />
                        </TableCell>

                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Chip
                            size="small"
                            label={ca.maternalDesc}
                            sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#db2777', 0.1), color: '#db2777' }}
                          />
                        </TableCell>

                        <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min((ca.contributionPercent / (inbreedingDetail.fx || 1)) * 100, 100)}
                                sx={{
                                  height: 6,
                                  borderRadius: '3px',
                                  bgcolor: 'divider',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#ea580c' },
                                }}
                              />
                            </Box>
                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.78rem', color: '#c2410c', minWidth: 48 }}>
                              +{ca.contributionPercent}%
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<FuseSvgIcon size={14}>heroicons-outline:map</FuseSvgIcon>}
                            onClick={() => caObj && setTraceAncestor(caObj)}
                            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.68rem', py: 0.2, px: 1, borderRadius: '4px' }}
                          >
                            Ver Ruta
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* 5. PROGENY & OFFSPRING PANEL */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: '6px',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 28, height: 28 }}>
              🐮
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Descendencia Registrada (Hijos e Hijas de #{selectedCaravan.identification})
            </Typography>
          </Stack>
          <Chip
            label={`${offspringList.length} Crías`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        {offspringList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '4px' }}>
            <Typography variant="body2" color="text.secondary">
              No hay crías registradas con #{selectedCaravan.identification} como progenitor.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" sx={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>Cría</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>Categoría / Raza</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>Otro Progenitor (Pareja)</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', borderRight: 1, borderColor: 'divider' }}>Consanguinidad ($F_X$)</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', textAlign: 'center' }}>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offspringList.map(({ caravan: child, record: childRecord, mate }) => {
                  const isChildMale = child.sex === 'M';
                  const childFx = childRecord?.inbreedingCoefficient || 0;

                  return (
                    <TableRow key={child.id} hover>
                      {/* Child ID */}
                      <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 22,
                              height: 22,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: isChildMale ? '#0284c7' : '#db2777',
                              color: '#ffffff',
                            }}
                          >
                            {isChildMale ? '♂' : '♀'}
                          </Avatar>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.82rem' }}>
                            #{child.identification}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Category */}
                      <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                          {child.category || 'Ternero'} • {child.breed || 'Sin Raza'}
                        </Typography>
                      </TableCell>

                      {/* Mate */}
                      <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                        {mate ? (
                          <Chip
                            size="small"
                            label={`#${mate.identification} (${mate.sex === 'M' ? 'Toro ♂' : 'Vaca ♀'})`}
                            onClick={() => setSelectedId(mate.id)}
                            sx={{ fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                            — No registrado
                          </Typography>
                        )}
                      </TableCell>

                      {/* Inbreeding */}
                      <TableCell sx={{ borderRight: 1, borderColor: 'divider' }}>
                        <Chip
                          size="small"
                          label={`Fx: ${childFx}%`}
                          color={childFx > 6.25 ? 'error' : childFx > 3.125 ? 'warning' : 'success'}
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                        />
                      </TableCell>

                      {/* Action */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          onClick={() => setSelectedId(child.id)}
                          startIcon={<FuseSvgIcon size={14}>heroicons-outline:arrows-pointing-in</FuseSvgIcon>}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem' }}
                        >
                          Enfocar en Árbol
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ========================================================================= */}
      {/* 6. ASIDE DRAWER: DETAILED VISUAL PATH OF THE COMMON ANCESTOR              */}
      {/* ========================================================================= */}
      <Drawer
        anchor="right"
        open={Boolean(traceAncestor)}
        onClose={() => setTraceAncestor(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520 },
            p: 3,
            bgcolor: isDark ? 'background.paper' : '#fcfdfd',
          },
        }}
      >
        {traceAncestor && (
          <Stack spacing={3}>
            {/* Drawer Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: '#ea580c',
                    color: '#ffffff',
                    width: 44,
                    height: 44,
                    fontWeight: 900,
                    borderRadius: '6px',
                  }}
                >
                  <FuseSvgIcon size={24}>heroicons-outline:map</FuseSvgIcon>
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                    #{traceAncestor.identification}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {traceAncestor.category || 'Bovino'} • {traceAncestor.breed || 'Sin Raza'} • Ancestro Común
                  </Typography>
                </Box>
              </Stack>

              <IconButton size="small" onClick={() => setTraceAncestor(null)}>
                <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
              </IconButton>
            </Stack>

            <Divider />

            {/* Explanation Note */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '6px',
                bgcolor: isDark ? 'rgba(234, 88, 12, 0.12)' : '#fff7ed',
                border: '1px solid #fdba74',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#c2410c' }}>
                ¿Por qué #{traceAncestor.identification} causa consanguinidad en #{selectedCaravan.identification}?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', mt: 0.5, lineHeight: 1.4 }}>
                Este animal está presente en la <strong>línea del padre</strong> y simultáneamente en la <strong>línea de la madre</strong>. El ternero recibe copias duplicadas de sus genes por ambas vías.
              </Typography>
            </Paper>

            {/* Visual Paths Timelines */}
            <Stack spacing={2}>
              {/* Branch 1: Paternal Path */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <FuseSvgIcon size={16}>heroicons-outline:arrow-right-circle</FuseSvgIcon>
                  1. Entrada por la Línea Paterna (del Padre ♂)
                </Typography>

                {tracePaths.paternal.length === 0 ? (
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    — No se encontró ruta directa por la rama del padre.
                  </Typography>
                ) : (
                  tracePaths.paternal.map((path, pathIdx) => (
                    <Paper
                      key={pathIdx}
                      variant="outlined"
                      sx={{ p: 1.5, mb: 1, borderRadius: '6px', bgcolor: isDark ? 'rgba(2, 132, 199, 0.04)' : '#f0f9ff', borderColor: alpha('#0284c7', 0.3) }}
                    >
                      <Stack spacing={1}>
                        {path.map((item, stepIdx) => (
                          <Stack key={item.id} direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: stepIdx === path.length - 1 ? '#ea580c' : stepIdx === 0 ? 'text.secondary' : '#0284c7',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.62rem',
                                fontWeight: 900,
                              }}
                            >
                              {stepIdx + 1}
                            </Box>
                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem' }}>
                              #{item.identification}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({stepIdx === 0 ? 'Ternero Evaluado' : stepIdx === path.length - 1 ? '🎯 Ancestro Común' : item.category || 'Bovino'})
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>
                  ))
                )}
              </Box>

              {/* Branch 2: Maternal Path */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#db2777', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <FuseSvgIcon size={16}>heroicons-outline:arrow-right-circle</FuseSvgIcon>
                  2. Entrada por la Línea Materna (de la Vaca ♀)
                </Typography>

                {tracePaths.maternal.length === 0 ? (
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    — No se encontró ruta directa por la rama de la madre.
                  </Typography>
                ) : (
                  tracePaths.maternal.map((path, pathIdx) => (
                    <Paper
                      key={pathIdx}
                      variant="outlined"
                      sx={{ p: 1.5, mb: 1, borderRadius: '6px', bgcolor: isDark ? 'rgba(219, 39, 119, 0.04)' : '#fdf2f8', borderColor: alpha('#db2777', 0.3) }}
                    >
                      <Stack spacing={1}>
                        {path.map((item, stepIdx) => (
                          <Stack key={item.id} direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: stepIdx === path.length - 1 ? '#ea580c' : stepIdx === 0 ? 'text.secondary' : '#db2777',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.62rem',
                                fontWeight: 900,
                              }}
                            >
                              {stepIdx + 1}
                            </Box>
                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem' }}>
                              #{item.identification}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({stepIdx === 0 ? 'Ternero Evaluado' : stepIdx === path.length - 1 ? '🎯 Ancestro Común' : item.category || 'Vientre'})
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>
                  ))
                )}
              </Box>
            </Stack>

            <Divider />

            {/* Actions inside Drawer */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedId(traceAncestor.id);
                  setTraceAncestor(null);
                }}
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-pointing-in</FuseSvgIcon>}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Enfocar Árbol en #{traceAncestor.identification}
              </Button>

              <Button
                variant="contained"
                onClick={() => setTraceAncestor(null)}
                sx={{ textTransform: 'none', fontWeight: 800 }}
              >
                Cerrar Ruta
              </Button>
            </Stack>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}

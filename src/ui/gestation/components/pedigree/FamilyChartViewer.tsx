import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tooltip,
  Autocomplete,
  TextField,
  Chip,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';

interface FamilyChartViewerProps {
  caravans: Caravan[];
  pedigreeRecords: PedigreeRecord[];
  initialRootId?: number | null;
  onOpenMatingAdvisor: (record?: PedigreeRecord) => void;
}

interface F3Datum {
  id: string;
  data: {
    id: number;
    identification: string;
    gender: 'M' | 'F';
    'first name': string;
    'last name': string;
    birthday: string;
    category?: string;
    breed?: string;
    batchName?: string;
    current_weight?: number | null;
    fx: number;
    fxRisk: string;
    treeDepth: number;
    depthLabel: string;
    offspringCount: number;
    fatherId?: number | null;
    motherId?: number | null;
    [key: string]: any;
  };
  rels: {
    parents: string[];
    spouses: string[];
    children: string[];
  };
}

export default function FamilyChartViewer({
  caravans,
  pedigreeRecords,
  initialRootId,
  onOpenMatingAdvisor,
}: FamilyChartViewerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  // Selected animal to focus in tree
  const [selectedRootId, setSelectedRootId] = useState<number | null>(initialRootId || null);

  // Quick detail modal on node click
  const [selectedNode, setSelectedNode] = useState<F3Datum['data'] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Map for fast lookups
  const recordsMap = useMemo(() => {
    const map = new Map<number, PedigreeRecord>();
    pedigreeRecords.forEach((r) => map.set(r.id, r));
    return map;
  }, [pedigreeRecords]);

  // Convert caravans & pedigree records into F3 chart data structure
  const f3Data: F3Datum[] = useMemo(() => {
    if (caravans.length === 0) return [];

    const nodes: F3Datum[] = caravans.map((c) => {
      const record = recordsMap.get(c.id);
      const isMale = c.sex === 'M';
      const fatherId = c.lineage?.father_id ? c.lineage.father_id.toString() : null;
      const motherId = c.lineage?.mother_id ? c.lineage.mother_id.toString() : null;

      const parents: string[] = [];
      if (fatherId && caravans.some((x) => x.id.toString() === fatherId)) {
        parents.push(fatherId);
      }
      if (motherId && caravans.some((x) => x.id.toString() === motherId)) {
        parents.push(motherId);
      }

      const fx = record?.inbreedingCoefficient || 0;
      const weightText = c.current_weight ? ` • ${c.current_weight}kg` : '';

      return {
        id: c.id.toString(),
        data: {
          id: c.id,
          identification: c.identification,
          gender: isMale ? 'M' : 'F',
          'first name': `${isMale ? '♂' : '♀'} #${c.identification}`,
          'last name': `${c.category || 'Bovino'} (${c.breed || 'Sin Raza'})`,
          birthday: `Fx: ${fx}%${weightText}`,
          category: c.category || undefined,
          breed: c.breed || undefined,
          batchName: record?.batchName,
          current_weight: c.current_weight || null,
          fx,
          fxRisk: record?.inbreedingRisk || 'OPTIMAL',
          treeDepth: record?.treeDepth || 0,
          depthLabel: record?.depthLabel || '0G',
          fatherId: c.lineage?.father_id || null,
          motherId: c.lineage?.mother_id || null,
          offspringCount: record?.offspringCount || 0,
        },
        rels: {
          parents,
          spouses: [],
          children: [],
        },
      };
    });

    // Use F3 official formatData function to construct bidirectional relationships
    return f3.formatData(nodes) as F3Datum[];
  }, [caravans, recordsMap]);

  // Candidates for root selection (only those with relationships)
  const connectedCaravans = useMemo(() => {
    return f3Data.filter(
      (d) => d.rels.parents.length > 0 || d.rels.children.length > 0 || d.rels.spouses.length > 0
    );
  }, [f3Data]);

  // Initial root candidate fallback
  useEffect(() => {
    if (initialRootId) {
      setSelectedRootId(initialRootId);
    } else if (!selectedRootId && connectedCaravans.length > 0) {
      setSelectedRootId(connectedCaravans[0].data.id);
    }
  }, [initialRootId, connectedCaravans, selectedRootId]);

  // Initialize and update F3 Chart
  useEffect(() => {
    if (!containerRef.current || f3Data.length === 0) return;

    // Clear previous container contents
    containerRef.current.innerHTML = '';

    try {
      // 1. Create Chart instance
      const chart = f3.createChart(containerRef.current, f3Data as any)
        .setTransitionTime(500)
        .setCardXSpacing(70)
        .setCardYSpacing(90)
        .setSingleParentEmptyCard(true);

      chartInstanceRef.current = chart;

      // 2. Configure SVG card rendering (Rock solid SVG coordinate alignment and crisp connector branches)
      const card = chart.setCardSvg();
      card.setCardDim({
        w: 230,
        h: 75,
        text_x: 20,
        text_y: 16,
        img_w: 48,
        img_h: 48,
        img_x: 10,
        img_y: 12,
      });

      card.setCardDisplay([
        (d: any) => d['first name'],
        (d: any) => d['last name'],
        (d: any) => d.birthday,
      ]);

      // Card click event to show detailed modal
      card.setOnCardClick((_: any, d: any) => {
        const itemData = d.data?.data || d.data;
        if (itemData) {
          setSelectedNode(itemData);
          setDetailsOpen(true);
        }
      });

      // If a root ID is selected, set as main datum
      if (selectedRootId) {
        chart.updateMainId(selectedRootId.toString());
      }

      // Render tree
      chart.updateTree({ initial: true, tree_position: 'fit' });
    } catch (err) {
      console.error('Error initializing family-chart:', err);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [f3Data, isDark]);

  // Handle root change
  const handleSelectRoot = (caravanId: number | null) => {
    setSelectedRootId(caravanId);
    if (chartInstanceRef.current && caravanId) {
      try {
        chartInstanceRef.current.updateMainId(caravanId.toString());
        chartInstanceRef.current.updateTree({ tree_position: 'fit' });
      } catch (err) {
        console.error('Error updating main id in family-chart:', err);
      }
    }
  };

  // Zoom / Fit handlers
  const handleFitTree = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.updateTree({ tree_position: 'fit' });
    }
  }, []);

  const handleCenterMain = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.updateTree({ tree_position: 'main_to_middle' });
    }
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dynamic CSS styles for crisp branches and SVG cards */}
      <style>
        {`
          /* Chart Canvas Background */
          #FamilyChart {
            background-color: ${isDark ? '#090d16' : '#f8fafc'};
          }

          /* ========================================================= */
          /* 🌳 HIGH-VISIBILITY GENEALOGICAL BRANCHES (LINKS)          */
          /* ========================================================= */
          .f3 svg.main_svg path.link {
            stroke: ${isDark ? '#38bdf8' : '#0284c7'} !important;
            stroke-width: 3px !important;
            stroke-linecap: round !important;
            stroke-linejoin: round !important;
            fill: none !important;
            opacity: 0.95 !important;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15)) !important;
          }

          /* Golden highlight on main path */
          .f3 svg.main_svg path.link.f3-path-to-main {
            stroke: #f59e0b !important;
            stroke-width: 5px !important;
            opacity: 1 !important;
            filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.8)) !important;
          }

          /* ========================================================= */
          /* 🎴 SVG CARDS (NO OVERLAPPING - PURE SVG COORDINATES)       */
          /* ========================================================= */
          .f3 rect.card-male {
            fill: ${isDark ? '#1e293b' : '#ffffff'} !important;
            stroke: #0284c7 !important;
            stroke-width: 2.5px !important;
            rx: 10px !important;
            ry: 10px !important;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)) !important;
            cursor: pointer !important;
          }

          .f3 rect.card-female {
            fill: ${isDark ? '#1e293b' : '#ffffff'} !important;
            stroke: #db2777 !important;
            stroke-width: 2.5px !important;
            rx: 10px !important;
            ry: 10px !important;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)) !important;
            cursor: pointer !important;
          }

          .f3 rect.card-genderless {
            fill: ${isDark ? '#1e293b' : '#f1f5f9'} !important;
            stroke: #94a3b8 !important;
            stroke-width: 1.5px !important;
            rx: 10px !important;
            ry: 10px !important;
          }

          /* Active Root Outline */
          .f3 .card-main-outline {
            stroke: #f59e0b !important;
            stroke-width: 4px !important;
            rx: 12px !important;
            ry: 12px !important;
          }

          /* Card Typography */
          .f3 text {
            font-family: inherit !important;
          }
          .f3 text:nth-of-type(1) {
            font-weight: 900 !important;
            font-size: 14px !important;
            fill: ${isDark ? '#f8fafc' : '#0f172a'} !important;
          }
          .f3 text:nth-of-type(2) {
            font-weight: 600 !important;
            font-size: 11px !important;
            fill: ${isDark ? '#94a3b8' : '#475569'} !important;
          }
          .f3 text:nth-of-type(3) {
            font-weight: 700 !important;
            font-size: 11px !important;
            fill: #16a34a !important;
          }
        `}
      </style>

      {/* Top Toolbar */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: '8px',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          {/* Autocomplete Selector */}
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 360 } }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                color: 'text.secondary',
                display: 'block',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}
            >
              Enfocar Animal / Reproductor Raíz
            </Typography>
            <Autocomplete
              size="small"
              options={connectedCaravans}
              value={connectedCaravans.find((c) => c.data.id === selectedRootId) || null}
              onChange={(_, val) => handleSelectRoot(val ? val.data.id : null)}
              getOptionLabel={(option) =>
                `#${option.data.identification} — ${option.data.category || 'Bovino'} (${
                  option.data.gender === 'M' ? 'Macho' : 'Hembra'
                }) [Fx: ${option.data.fx}%]`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar caravana para centrar árbol..."
                />
              )}
            />
          </Box>

          {/* Quick Actions & Canvas Controls */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Tooltip title="Ajustar árbol a la pantalla">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>}
                onClick={handleFitTree}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Ajustar (Fit)
              </Button>
            </Tooltip>

            <Tooltip title="Centrar en el animal principal">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:viewfinder-circle</FuseSvgIcon>}
                onClick={handleCenterMain}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Centrar
              </Button>
            </Tooltip>

            <Tooltip title="Simular apareamiento con este linaje">
              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:sparkles</FuseSvgIcon>}
                onClick={() => {
                  const record = selectedRootId ? recordsMap.get(selectedRootId) : undefined;
                  onOpenMatingAdvisor(record);
                }}
                sx={{ textTransform: 'none', fontWeight: 800 }}
              >
                Simular Cruza
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Interactive Family Chart Canvas */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: isDark ? 'grey.950' : 'grey.50',
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)'
            : 'radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          position: 'relative',
          minHeight: 560,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {connectedCaravans.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <FuseSvgIcon size={48} color="disabled">
              heroicons-outline:user-group
            </FuseSvgIcon>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              No hay relaciones genealógicas cargadas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registre padres y madres en las caravanas para generar el árbol interactivo.
            </Typography>
          </Box>
        ) : (
          <Box
            ref={containerRef}
            id="FamilyChart"
            sx={{
              width: '100%',
              height: 600,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
            }}
          />
        )}
      </Paper>

      {/* Node Click Quick Detail Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        {selectedNode && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    bgcolor: selectedNode.gender === 'M' ? 'info.light' : 'secondary.light',
                    color: selectedNode.gender === 'M' ? 'info.contrastText' : 'secondary.contrastText',
                  }}
                >
                  {selectedNode.gender === 'M' ? '♂' : '♀'}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    #{selectedNode.identification}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedNode.category || 'Bovino'} • {selectedNode.breed || 'Sin Raza'}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={selectedNode.depthLabel}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Coeficiente de Consanguinidad ($F_X$):
                  </Typography>
                  <Chip
                    label={`${selectedNode.fx}% (${selectedNode.fxRisk})`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                    color={
                      selectedNode.fxRisk === 'OPTIMAL' || selectedNode.fxRisk === 'VERY_LOW'
                        ? 'success'
                        : selectedNode.fxRisk === 'MODERATE'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>

                {selectedNode.current_weight && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Peso Actual:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedNode.current_weight} kg
                    </Typography>
                  </Box>
                )}

                {selectedNode.batchName && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lote Actual:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedNode.batchName}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Hijos Registrados:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedNode.offspringCount} descendientes
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, pb: 2, justifyContent: 'space-between' }}>
              <Button
                size="small"
                onClick={() => {
                  handleSelectRoot(selectedNode.id);
                  setDetailsOpen(false);
                }}
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-pointing-in</FuseSvgIcon>}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Hacer Raíz
              </Button>

              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>}
                onClick={() => {
                  const record = recordsMap.get(selectedNode.id);
                  setDetailsOpen(false);
                  onOpenMatingAdvisor(record);
                }}
                sx={{ textTransform: 'none', fontWeight: 800 }}
              >
                Simular Cruza
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

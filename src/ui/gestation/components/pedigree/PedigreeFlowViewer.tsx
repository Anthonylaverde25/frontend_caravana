import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tooltip,
  Autocomplete,
  TextField,
  Button,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';
import CattleNode, { CattleNodeData } from './react-flow/CattleNode';

const nodeTypes = {
  cattleNode: CattleNode,
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 110;

/**
 * Calculates hierarchical tree layout using Dagre.
 */
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 50 : 65,
    ranksep: isHorizontal ? 90 : 90,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

interface PedigreeFlowViewerProps {
  caravans: Caravan[];
  pedigreeRecords: PedigreeRecord[];
  initialRootId?: number | null;
  onOpenMatingAdvisor: (record?: PedigreeRecord) => void;
}

function FlowContent({
  caravans,
  pedigreeRecords,
  initialRootId,
  onOpenMatingAdvisor,
}: PedigreeFlowViewerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { fitView } = useReactFlow();

  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
  const [selectedCaravanId, setSelectedCaravanId] = useState<number | null>(initialRootId || null);
  const [filterFamilyOnly, setFilterFamilyOnly] = useState(false);

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<PedigreeRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const recordsMap = useMemo(() => {
    const map = new Map<number, PedigreeRecord>();
    pedigreeRecords.forEach((r) => map.set(r.id, r));
    return map;
  }, [pedigreeRecords]);

  // Build raw nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Filter relevant caravans if family-only filter is active
    let activeCaravans = caravans;
    if (filterFamilyOnly && selectedCaravanId) {
      const familyIds = new Set<number>();
      const queue = [selectedCaravanId];
      familyIds.add(selectedCaravanId);

      // Traversal for ancestors and descendants
      while (queue.length > 0) {
        const currId = queue.shift()!;
        const c = caravans.find((x) => x.id === currId);
        if (c?.lineage) {
          if (c.lineage.father_id && !familyIds.has(c.lineage.father_id)) {
            familyIds.add(c.lineage.father_id);
            queue.push(c.lineage.father_id);
          }
          if (c.lineage.mother_id && !familyIds.has(c.lineage.mother_id)) {
            familyIds.add(c.lineage.mother_id);
            queue.push(c.lineage.mother_id);
          }
        }
        // Descendants
        caravans.forEach((other) => {
          if (
            (other.lineage?.father_id === currId || other.lineage?.mother_id === currId) &&
            !familyIds.has(other.id)
          ) {
            familyIds.add(other.id);
            queue.push(other.id);
          }
        });
      }
      activeCaravans = caravans.filter((c) => familyIds.has(c.id));
    }

    // Generate Nodes
    activeCaravans.forEach((c) => {
      const record = recordsMap.get(c.id);
      const isMale = c.sex === 'M';
      const isSelected = c.id === selectedCaravanId;

      nodes.push({
        id: c.id.toString(),
        type: 'cattleNode',
        position: { x: 0, y: 0 },
        data: {
          id: c.id,
          identification: c.identification,
          sex: c.sex === 'M' ? 'M' : 'H',
          category: c.category,
          breed: c.breed,
          batchName: record?.batchName,
          current_weight: c.current_weight,
          fx: record?.inbreedingCoefficient || 0,
          fxRisk: record?.inbreedingRisk || 'OPTIMAL',
          treeDepth: record?.treeDepth || 0,
          depthLabel: record?.depthLabel || '0G',
          offspringCount: record?.offspringCount || 0,
          isRoot: isSelected,
          onOpenMatingAdvisor,
          record,
        } as CattleNodeData,
      });

      // Generate Paternal Edge (Father -> Child)
      if (c.lineage?.father_id && activeCaravans.some((x) => x.id === c.lineage!.father_id)) {
        edges.push({
          id: `e-${c.lineage.father_id}-${c.id}`,
          source: c.lineage.father_id.toString(),
          target: c.id.toString(),
          type: 'smoothstep',
          animated: isSelected,
          style: {
            stroke: '#0284c7',
            strokeWidth: isSelected ? 3.5 : 2.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#0284c7',
          },
          label: 'Padre ♂',
          labelStyle: {
            fontSize: '10px',
            fontWeight: 800,
            fill: '#0284c7',
          },
          labelBgStyle: {
            fill: isDark ? '#0f172a' : '#ffffff',
            fillOpacity: 0.9,
            stroke: '#0284c7',
            strokeWidth: 1,
            borderRadius: 4,
          },
        });
      }

      // Generate Maternal Edge (Mother -> Child)
      if (c.lineage?.mother_id && activeCaravans.some((x) => x.id === c.lineage!.mother_id)) {
        edges.push({
          id: `e-${c.lineage.mother_id}-${c.id}`,
          source: c.lineage.mother_id.toString(),
          target: c.id.toString(),
          type: 'smoothstep',
          animated: isSelected,
          style: {
            stroke: '#db2777',
            strokeWidth: isSelected ? 3.5 : 2.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#db2777',
          },
          label: 'Madre ♀',
          labelStyle: {
            fontSize: '10px',
            fontWeight: 800,
            fill: '#db2777',
          },
          labelBgStyle: {
            fill: isDark ? '#0f172a' : '#ffffff',
            fillOpacity: 0.9,
            stroke: '#db2777',
            strokeWidth: 1,
            borderRadius: 4,
          },
        });
      }
    });

    return getLayoutedElements(nodes, edges, direction);
  }, [caravans, recordsMap, selectedCaravanId, filterFamilyOnly, direction, isDark, onOpenMatingAdvisor]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize layout when input changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 600 });
    }, 50);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  // Node click handler
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const id = Number(node.id);
      setSelectedCaravanId(id);
      const record = recordsMap.get(id);
      if (record) {
        setSelectedRecord(record);
        setModalOpen(true);
      }
    },
    [recordsMap]
  );

  // Search handler
  const handleSelectSearch = (caravanId: number | null) => {
    setSelectedCaravanId(caravanId);
    if (caravanId) {
      setTimeout(() => {
        fitView({
          nodes: [{ id: caravanId.toString() }],
          duration: 800,
          padding: 0.5,
        });
      }, 100);
    }
  };

  // Connected caravans for search
  const connectedCaravans = useMemo(() => {
    return caravans.filter((c) => {
      const hasFather = c.lineage?.father_id != null;
      const hasMother = c.lineage?.mother_id != null;
      const hasChildren = caravans.some(
        (other) => other.lineage?.father_id === c.id || other.lineage?.mother_id === c.id
      );
      return hasFather || hasMother || hasChildren;
    });
  }, [caravans]);

  return (
    <Box sx={{ width: '100%' }}>
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
              Buscar y Enfocar Animal en el Árbol
            </Typography>
            <Autocomplete
              size="small"
              options={connectedCaravans}
              value={connectedCaravans.find((c) => c.id === selectedCaravanId) || null}
              onChange={(_, val) => handleSelectSearch(val ? val.id : null)}
              getOptionLabel={(option) =>
                `#${option.identification} — ${option.category || 'Bovino'} (${
                  option.sex === 'M' ? 'Macho' : 'Hembra'
                })`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar caravana para enfocar nodo..."
                />
              )}
            />
          </Box>

          {/* Quick Actions & Canvas Controls */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip
              label={filterFamilyOnly ? 'Familia Directa' : 'Rodeo Completo'}
              size="small"
              color={filterFamilyOnly ? 'primary' : 'default'}
              variant={filterFamilyOnly ? 'filled' : 'outlined'}
              onClick={() => setFilterFamilyOnly((prev) => !prev)}
              clickable
              sx={{ fontWeight: 700, height: 28 }}
            />

            <Tooltip title="Alternar orientación vertical / horizontal">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-up-down</FuseSvgIcon>}
                onClick={() => setDirection((prev) => (prev === 'TB' ? 'LR' : 'TB'))}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {direction === 'TB' ? 'Vertical (Arriba-Abajo)' : 'Horizontal'}
              </Button>
            </Tooltip>

            <Tooltip title="Ajustar todo a la pantalla">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>}
                onClick={() => fitView({ padding: 0.2, duration: 600 })}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Ajustar (Fit)
              </Button>
            </Tooltip>

            <Tooltip title="Simular apareamiento (cruza)">
              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<FuseSvgIcon size={18}>heroicons-outline:sparkles</FuseSvgIcon>}
                onClick={() => {
                  const record = selectedCaravanId ? recordsMap.get(selectedCaravanId) : undefined;
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

      {/* React Flow Canvas */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          height: 640,
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: isDark ? '#090d16' : '#f8fafc',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              const data = n.data as unknown as CattleNodeData;
              return data?.sex === 'M' ? '#0284c7' : '#db2777';
            }}
            nodeColor={(n) => {
              const data = n.data as unknown as CattleNodeData;
              return data?.sex === 'M' ? '#e0f2fe' : '#fce7f3';
            }}
            nodeBorderRadius={4}
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </Paper>

      {/* Node Detail Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        {selectedRecord && (
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
                    bgcolor: selectedRecord.sex === 'M' ? 'info.light' : 'secondary.light',
                    color: selectedRecord.sex === 'M' ? 'info.contrastText' : 'secondary.contrastText',
                  }}
                >
                  {selectedRecord.sex === 'M' ? '♂' : '♀'}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    #{selectedRecord.identification}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedRecord.category || 'Bovino'} • {selectedRecord.breed || 'Sin Raza'}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={selectedRecord.depthLabel}
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
                    Consanguinidad ($F_X$):
                  </Typography>
                  <Chip
                    label={`${selectedRecord.inbreedingCoefficient}% (${selectedRecord.inbreedingRisk})`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                    color={
                      selectedRecord.inbreedingRisk === 'OPTIMAL' || selectedRecord.inbreedingRisk === 'VERY_LOW'
                        ? 'success'
                        : selectedRecord.inbreedingRisk === 'MODERATE'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>

                {selectedRecord.paternalGrandsire && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Abuelo Paterno (PGS):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      #{selectedRecord.paternalGrandsire.identification}
                    </Typography>
                  </Box>
                )}

                {selectedRecord.maternalGrandsire && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Abuelo Materno (MGS):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      #{selectedRecord.maternalGrandsire.identification}
                    </Typography>
                  </Box>
                )}

                {selectedRecord.batchName && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lote Actual:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedRecord.batchName}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Hijos Registrados:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedRecord.offspringCount} descendientes
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, pb: 2, justifyContent: 'space-between' }}>
              <Button
                size="small"
                onClick={() => {
                  setFilterFamilyOnly(true);
                  setModalOpen(false);
                }}
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:funnel</FuseSvgIcon>}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Filtrar Familia
              </Button>

              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>}
                onClick={() => {
                  setModalOpen(false);
                  onOpenMatingAdvisor(selectedRecord);
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

export default function PedigreeFlowViewer(props: PedigreeFlowViewerProps) {
  return (
    <ReactFlowProvider>
      <FlowContent {...props} />
    </ReactFlowProvider>
  );
}

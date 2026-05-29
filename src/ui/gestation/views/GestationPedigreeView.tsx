import { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import calcTree from 'relatives-tree';
import type { Node as RelativeNode, Gender } from 'relatives-tree/lib/types';

// Define the dimensions of our nodes
const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;
const GAP_X = 60;
const GAP_Y = 80;

const xScale = NODE_WIDTH + GAP_X; // 280
const yScale = NODE_HEIGHT + GAP_Y; // 170

// Transform grid coordinates from relatives-tree to real pixels
const transformX = (x: number) => (x - 0.5) * xScale + NODE_WIDTH / 2;
const transformY = (y: number) => (y - 0.5) * yScale + NODE_HEIGHT / 2;

interface MutableNode {
  id: string;
  gender: Gender;
  parents: { id: string; type: 'blood' }[];
  children: { id: string; type: 'blood' }[];
  siblings: { id: string; type: 'blood' }[];
  spouses: { id: string; type: 'married' }[];
}

/**
 * Builds nodes and relationships for the relatives-tree calculation.
 */
function buildRelativesTreeData(caravans: Caravan[], rootId: number): RelativeNode[] {
  const nodesMap = new Map<string, MutableNode>();

  const getGender = (sex: string | null): Gender => {
    return (sex === 'M' ? 'male' : 'female') as Gender;
  };

  const processCaravan = (id: number) => {
    const idStr = id.toString();
    if (nodesMap.has(idStr)) return;

    const caravan = caravans.find(c => c.id === id);
    if (!caravan) return;

    const node: MutableNode = {
      id: idStr,
      gender: getGender(caravan.sex),
      parents: [],
      children: [],
      siblings: [],
      spouses: []
    };

    nodesMap.set(idStr, node);

    if (caravan.lineage) {
      const fatherId = caravan.lineage.father_id;
      const motherId = caravan.lineage.mother_id;

      if (fatherId) {
        node.parents.push({ id: fatherId.toString(), type: 'blood' });
        processCaravan(fatherId);
        const fatherNode = nodesMap.get(fatherId.toString());
        if (fatherNode) {
          if (!fatherNode.children.some(c => c.id === idStr)) {
            fatherNode.children.push({ id: idStr, type: 'blood' });
          }
          if (motherId && !fatherNode.spouses.some(s => s.id === motherId.toString())) {
            fatherNode.spouses.push({ id: motherId.toString(), type: 'married' });
          }
        }
      }

      if (motherId) {
        node.parents.push({ id: motherId.toString(), type: 'blood' });
        processCaravan(motherId);
        const motherNode = nodesMap.get(motherId.toString());
        if (motherNode) {
          if (!motherNode.children.some(c => c.id === idStr)) {
            motherNode.children.push({ id: idStr, type: 'blood' });
          }
          if (fatherId && !motherNode.spouses.some(s => s.id === fatherId.toString())) {
            motherNode.spouses.push({ id: fatherId.toString(), type: 'married' });
          }
        }
      }
    }

    // Search for biological children of this caravan in the active list
    caravans.forEach(other => {
      if (other.lineage) {
        const isChild = other.lineage.father_id === id || other.lineage.mother_id === id;
        if (isChild) {
          const childIdStr = other.id.toString();
          if (!node.children.some(c => c.id === childIdStr)) {
            node.children.push({ id: childIdStr, type: 'blood' });
          }
          processCaravan(other.id);
          const childNode = nodesMap.get(childIdStr);
          if (childNode && !childNode.parents.some(p => p.id === idStr)) {
            childNode.parents.push({ id: idStr, type: 'blood' });
          }
        }
      }
    });
  };

  processCaravan(rootId);
  return Array.from(nodesMap.values()) as unknown as RelativeNode[];
}

function GestationPedigreeView() {
  const theme = useTheme();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);

  // ID of the caravan that the user searched for to highlight and scroll
  const [highlightedNodeId, setHighlightedNodeId] = useState<number | null>(null);

  // Filter caravans that have at least one family relationship (father, mother or children)
  const searchableCaravans = useMemo(() => {
    return caravans.filter(c => {
      const hasFather = c.lineage?.father_id != null;
      const hasMother = c.lineage?.mother_id != null;
      const hasChildren = caravans.some(other => 
        other.lineage?.father_id === c.id || 
        other.lineage?.mother_id === c.id
      );
      return hasFather || hasMother || hasChildren;
    });
  }, [caravans]);

  // Compute all disjoint family trees (connected components)
  const familyTrees = useMemo(() => {
    if (caravans.length === 0) return [];

    const visited = new Set<number>();
    const trees: { root: Caravan; treeData: any }[] = [];

    // Sort caravans stably by ID to guarantee consistent order of execution
    const sortedCaravans = [...caravans].sort((a, b) => a.id - b.id);

    for (const caravan of sortedCaravans) {
      if (visited.has(caravan.id)) continue;

      // Check if the animal has any family relationships
      const hasFather = caravan.lineage?.father_id != null;
      const hasMother = caravan.lineage?.mother_id != null;
      const hasChildren = caravans.some(other => 
        other.lineage?.father_id === caravan.id || 
        other.lineage?.mother_id === caravan.id
      );

      // Skip isolated caravans
      if (!hasFather && !hasMother && !hasChildren) continue;

      try {
        const flatNodes = buildRelativesTreeData(caravans, caravan.id);
        
        if (flatNodes.length > 1) {
          const flatNodeIds = new Set(flatNodes.map(n => Number(n.id)));
          
          let rootCandidate = caravan;
          
          // Find founder nodes (nodes that don't have parents in this family group)
          const rootNodes = flatNodes.filter(n => {
            const c = caravans.find(x => x.id === Number(n.id));
            if (!c) return false;
            const fatherInTree = c.lineage?.father_id && flatNodeIds.has(c.lineage.father_id);
            const motherInTree = c.lineage?.mother_id && flatNodeIds.has(c.lineage.mother_id);
            return !fatherInTree && !motherInTree;
          });

          // Use the first founder node we find as the root candidate for calcTree
          if (rootNodes.length > 0) {
            const candidate = caravans.find(x => x.id === Number(rootNodes[0].id));
            if (candidate) {
              rootCandidate = candidate;
            }
          }

          const calculatedTree = calcTree(flatNodes, { rootId: rootCandidate.id.toString() });
          
          trees.push({
            root: rootCandidate,
            treeData: calculatedTree
          });

          // Mark all processed nodes in this family component as visited
          flatNodes.forEach(n => visited.add(Number(n.id)));
        }
      } catch (e) {
        console.error('Error generating family tree for caravan', caravan.id, e);
      }
    }

    return trees;
  }, [caravans]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando datos genealógicos...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Árbol Genealógico y Pedigree"
      subtitle="Visualice las líneas de descendencia y ascendencia de las caravanas de su establecimiento de forma completa."
    >
      <Stack spacing={4}>
        {/* Selector & Search Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: '8px',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 3
          }}
        >
          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
              Buscar Caravana en los Árboles
            </Typography>
            <Autocomplete
              size="small"
              options={searchableCaravans}
              getOptionLabel={(option) => `Caravana #${option.identification} - ${option.category || 'N/A'} [${option.sex === 'M' ? 'Macho' : 'Hembra'}]`}
              onChange={(_, newValue) => {
                if (newValue) {
                  setHighlightedNodeId(newValue.id);
                  setTimeout(() => {
                    const element = document.getElementById(`caravan-node-${newValue.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);

                  // Reset highlight after 3 seconds
                  setTimeout(() => {
                    setHighlightedNodeId(prev => prev === newValue.id ? null : prev);
                  }, 3000);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Escriba número de identificación de la caravana..." />
              )}
            />
          </Box>
        </Paper>

        {/* Tree Container Canvas List */}
        {familyTrees.map((family, idx) => {
          const { root, treeData } = family;
          const canvasWidth = treeData.canvas.width * xScale;
          const canvasHeight = treeData.canvas.height * yScale;

          return (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              {/* Family Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'action.selected',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: root.sex === 'M' ? 'info.light' : 'secondary.light',
                      color: root.sex === 'M' ? 'info.contrastText' : 'secondary.contrastText',
                      fontSize: '0.9rem',
                      fontWeight: 700
                    }}
                  >
                    {root.sex === 'M' ? '♂' : '♀'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      Familia de Caravana #{root.identification}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fundador de línea genealógica • {root.breed || 'Sin Raza'}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={`${treeData.nodes.length} Miembros`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              {/* Interactive Family Canvas */}
              <Box
                sx={{
                  p: 4,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.950' : 'grey.50',
                  backgroundImage: theme.palette.mode === 'dark'
                    ? 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)'
                    : 'radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                  overflow: 'auto',
                  minHeight: 400,
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: canvasWidth,
                    height: canvasHeight,
                    position: 'relative',
                    mx: 'auto'
                  }}
                >
                  {/* SVG Connectors Rendering */}
                  <svg
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    {treeData.connectors.map((connector: number[], index: number) => {
                      const [x1, y1, x2, y2] = connector;
                      const px1 = transformX(x1);
                      const py1 = transformY(y1);
                      const px2 = transformX(x2);
                      const py2 = transformY(y2);
                      const d = `M ${px1} ${py1} L ${px2} ${py2}`;

                      return (
                        <path
                          key={index}
                          d={d}
                          fill="none"
                          stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </svg>

                  {/* HTML Nodes Rendering */}
                  {treeData.nodes.map((node: any) => {
                    const caravan = caravans.find(c => c.id === Number(node.id));
                    if (!caravan) return null;

                    const isMale = caravan.sex === 'M';
                    const isRoot = caravan.id === root.id;
                    const isHighlighted = caravan.id === highlightedNodeId;

                    return (
                      <Box
                        key={node.id}
                        id={`caravan-node-${caravan.id}`}
                        style={{
                          position: 'absolute',
                          left: node.left * xScale,
                          top: node.top * yScale,
                          width: NODE_WIDTH,
                          height: NODE_HEIGHT,
                          zIndex: isHighlighted ? 10 : 2
                        }}
                      >
                        <Card
                          variant="outlined"
                          sx={{
                            width: '100%',
                            height: '100%',
                            borderColor: isHighlighted
                              ? 'primary.main'
                              : isRoot
                              ? 'primary.dark'
                              : isMale
                              ? 'info.main'
                              : 'secondary.main',
                            borderWidth: isHighlighted || isRoot ? 2 : 1.5,
                            bgcolor: 'background.paper',
                            boxShadow: isHighlighted
                              ? `0 0 15px ${theme.palette.primary.main}`
                              : isRoot
                              ? 4
                              : 1,
                            transform: isHighlighted ? 'scale(1.05)' : 'none',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px) scale(1.02)',
                              boxShadow: 3,
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor: isMale ? 'info.light' : 'secondary.light',
                                  color: isMale ? 'info.contrastText' : 'secondary.contrastText',
                                  fontSize: '0.8rem',
                                  fontWeight: 700
                                }}
                              >
                                {isMale ? '♂' : '♀'}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                                  #{caravan.identification}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'capitalize', fontSize: '0.72rem' }}>
                                  {caravan.category || 'Sin Categoría'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontSize: '0.68rem' }}>
                                  {caravan.breed || 'Sin Raza'}
                                </Typography>
                              </Box>
                            </Stack>
                            {/* Footer Weight Tag */}
                            {caravan.current_weight && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1.5 }}>
                                <Chip
                                  label={`${caravan.current_weight} kg`}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    bgcolor: 'success.light',
                                    color: 'success.contrastText'
                                  }}
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Card>
          );
        })}

        {/* Empty State */}
        {familyTrees.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: '12px',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <FuseSvgIcon size={48} color="disabled">
                heroicons-outline:users
              </FuseSvgIcon>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No se encontraron relaciones genealógicas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              Para visualizar los árboles familiares, asegúrese de registrar los datos del Padre (Sire) y de la Madre (Dam) en sus caravanas.
            </Typography>
          </Paper>
        )}
      </Stack>
    </ViewLayout>
  );
}

export default GestationPedigreeView;

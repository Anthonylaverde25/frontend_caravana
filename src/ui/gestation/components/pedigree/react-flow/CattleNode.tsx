import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';

export interface CattleNodeData {
  id: number;
  identification: string;
  sex: 'M' | 'H';
  category?: string | null;
  breed?: string | null;
  batchName?: string;
  current_weight?: number | null;
  fx: number;
  fxRisk: string;
  treeDepth: number;
  depthLabel: string;
  offspringCount: number;
  isRoot?: boolean;
  onOpenMatingAdvisor?: (record?: PedigreeRecord) => void;
  record?: PedigreeRecord;
  [key: string]: any;
}

function CattleNode({ data, selected }: NodeProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const nodeData = data as unknown as CattleNodeData;
  const isMale = nodeData.sex === 'M';
  const isRoot = Boolean(nodeData.isRoot);

  const fxRisk = nodeData.fxRisk || 'OPTIMAL';
  let fxBg = '#dcfce7';
  let fxColor = '#166534';
  let fxBorder = '#86efac';

  if (fxRisk === 'MODERATE') {
    fxBg = '#fef9c3';
    fxColor = '#854d0e';
    fxBorder = '#fde047';
  } else if (fxRisk === 'HIGH' || fxRisk === 'CRITICAL') {
    fxBg = '#fee2e2';
    fxColor = '#991b1b';
    fxBorder = '#fca5a5';
  }

  return (
    <Box sx={{ position: 'relative', width: 240 }}>
      {/* Target Handle (Top - Parent connection) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: isMale ? '#0284c7' : '#db2777',
          border: '2px solid #ffffff',
          top: -5,
          zIndex: 10,
        }}
      />

      <Card
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: '8px',
          bgcolor: isDark ? 'background.paper' : '#ffffff',
          border: '1.5px solid',
          borderColor: selected
            ? 'primary.main'
            : isRoot
            ? '#f59e0b'
            : isMale
            ? 'info.main'
            : 'secondary.main',
          borderLeft: '5px solid',
          borderLeftColor: isMale ? '#0284c7' : '#db2777',
          boxShadow: selected
            ? `0 0 14px ${alpha(theme.palette.primary.main, 0.4)}`
            : isRoot
            ? '0 0 14px rgba(245, 158, 11, 0.35)'
            : '0 4px 10px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Header Row: Avatar, ID, and Actions */}
          <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: isMale ? 'info.light' : 'secondary.light',
                  color: isMale ? 'info.contrastText' : 'secondary.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                {isMale ? '♂' : '♀'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    color: 'text.primary',
                    lineHeight: 1.1,
                  }}
                >
                  #{nodeData.identification}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.68rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {nodeData.category || 'Bovino'} • {nodeData.breed || 'Sin Raza'}
                </Typography>
              </Box>
            </Stack>

            {/* Quick Simulate Mating action */}
            {nodeData.onOpenMatingAdvisor && (
              <Tooltip title="Simular cruza con este animal">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation();
                    nodeData.onOpenMatingAdvisor?.(nodeData.record);
                  }}
                  sx={{ p: 0.5 }}
                >
                  <FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Bottom Row: Fx Chip, Weight, and Depth */}
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Tooltip title={`Consanguinidad Fx: ${nodeData.fx}% (${nodeData.fxRisk})`} arrow>
              <Chip
                size="small"
                label={`Fx: ${nodeData.fx}%`}
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : fxBg,
                  color: fxColor,
                  border: '1px solid',
                  borderColor: fxBorder,
                }}
              />
            </Tooltip>

            {nodeData.current_weight && (
              <Chip
                size="small"
                label={`${nodeData.current_weight} kg`}
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                  color: '#166534',
                }}
              />
            )}

            <Chip
              size="small"
              label={nodeData.depthLabel || '0G'}
              color={nodeData.treeDepth >= 2 ? 'primary' : 'default'}
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Source Handle (Bottom - Offspring connection) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: isMale ? '#0284c7' : '#db2777',
          border: '2px solid #ffffff',
          bottom: -5,
          zIndex: 10,
        }}
      />
    </Box>
  );
}

export default memo(CattleNode);

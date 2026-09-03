import React from 'react';
import { Paper, Box, Typography, Button, Stack, IconButton, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardWidget } from '../board-manager/types';
import { DashboardSummaryCards, DashboardKPIs } from '../cards/DashboardSummaryCards';
import { DashboardHealthPanel, QuarantineCaravan, ConsumptionCaravan, DeathCaravan } from '../panels/DashboardHealthPanel';
import { DashboardHealthTables } from '../panels/health/DashboardHealthTables';
import { DashboardReproductivePanel } from '../panels/DashboardReproductivePanel';
import { DashboardPasturePanel } from '../panels/DashboardPasturePanel';

interface DashboardBlankCanvasProps {
  boardName: string;
  widgets?: DashboardWidget[];
  kpis: DashboardKPIs;
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onOpenAddWidget: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onActionClick: (action: string, tag: string) => void;
}

export const DashboardBlankCanvas: React.FC<DashboardBlankCanvasProps> = ({
  boardName,
  widgets = [],
  kpis,
  quarantineData,
  consumptionData,
  deathData,
  onOpenAddWidget,
  onRemoveWidget,
  onActionClick,
}) => {
  if (widgets.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 4, sm: 8 },
          borderRadius: '8px',
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderWidth: 2,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            bgcolor: 'action.hover',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <FuseSvgIcon size={36}>heroicons-outline:document-plus</FuseSvgIcon>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Tablero en blanco ({boardName})
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 3, fontSize: '0.84rem' }}>
          Este espacio está listo para ser personalizado. Comienza a armar tu tablero agregando métricas KPI, gráficos de evolución o tablas operativas.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={onOpenAddWidget}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
          sx={{ borderRadius: '6px', fontWeight: 700, px: 3, py: 1 }}
        >
          Agregar Primer Widget
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          WIDGETS CONFIGURADOS ({widgets.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onOpenAddWidget}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
          sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
        >
          Añadir Otro Widget
        </Button>
      </Box>

      {widgets.map((w) => (
        <Box key={w.id} sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
            <Tooltip title="Quitar widget del tablero" arrow>
              <IconButton size="small" onClick={() => onRemoveWidget(w.id)} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'error.light', color: '#ffffff' } }}>
                <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>

          {w.type === 'SUMMARY_KPIS' && <DashboardSummaryCards kpis={kpis} />}
          {w.type === 'HEALTH_CHARTS' && <DashboardHealthPanel quarantineData={quarantineData} consumptionData={consumptionData} deathData={deathData} onActionClick={onActionClick} />}
          {w.type === 'HEALTH_TABLES' && <DashboardHealthTables quarantineData={quarantineData} consumptionData={consumptionData} deathData={deathData} onActionClick={onActionClick} />}
          {w.type === 'REPRODUCTIVE_PROGRESS' && <DashboardReproductivePanel />}
          {w.type === 'REPRODUCTIVE_TABLE' && <DashboardReproductivePanel />}
          {w.type === 'PASTURE_CHART' && <DashboardPasturePanel />}
          {w.type === 'PASTURE_TABLE' && <DashboardPasturePanel />}
        </Box>
      ))}
    </Stack>
  );
};

export default DashboardBlankCanvas;

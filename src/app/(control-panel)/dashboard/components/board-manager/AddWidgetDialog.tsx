import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Paper,
  Chip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardWidget } from './types';

interface AddWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  onAddWidget: (widget: DashboardWidget) => void;
  existingWidgetIds?: string[];
}

const AVAILABLE_WIDGETS: { id: string; type: DashboardWidget['type']; title: string; category: string; desc: string; icon: string }[] = [
  { id: 'w_kpis', type: 'SUMMARY_KPIS', title: 'Tarjetas KPI Principales', category: 'Métricas Generales', desc: 'Resumen en 4 cards de sanidad, entore activo, faena y tasa de bajas.', icon: 'heroicons-outline:squares-2x2' },
  { id: 'w_health_charts', type: 'HEALTH_CHARTS', title: 'Gráficos de Sanidad & Bioseguridad', category: 'Sanidad', desc: 'Movimientos mensuales comparativos y distribución de severidad.', icon: 'heroicons-outline:chart-bar' },
  { id: 'w_health_tables', type: 'HEALTH_TABLES', title: 'Tablas de Cuarentena & Decesos', category: 'Sanidad', desc: 'Listados interactivos de animales aislados, faenados y actas de baja.', icon: 'heroicons-outline:table-cells' },
  { id: 'w_repro_charts', type: 'REPRODUCTIVE_PROGRESS', title: 'Curva de Servicios & Preñez', category: 'Reproducción', desc: 'Concepción acumulada en 60-90 días y meta de cabeza de parición.', icon: 'heroicons-outline:arrow-trending-up' },
  { id: 'w_repro_table', type: 'REPRODUCTIVE_TABLE', title: 'Lotes de Servicio en Campo', category: 'Reproducción', desc: 'Monitoreo de vientres, torada asignada y ratio por potrero.', icon: 'heroicons-outline:heart' },
  { id: 'w_pasture_chart', type: 'PASTURE_CHART', title: 'Carga Animal por Potrero (EV/ha)', category: 'Pasturas', desc: 'Equivalente vaca por hectárea y balance forrajero del campo.', icon: 'heroicons-outline:scale' },
  { id: 'w_pasture_table', type: 'PASTURE_TABLE', title: 'Estado y Rotación de Potreros', category: 'Pasturas', desc: 'Días de ocupación, superficie y descanso forrajero.', icon: 'heroicons-outline:sparkles' },
];

export const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({
  open,
  onClose,
  onAddWidget,
  existingWidgetIds = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' },
      }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDark ? 'rgba(16, 185, 129, 0.16)' : '#dcfce7', color: '#107e3e' }}>
            <FuseSvgIcon size={22}>heroicons-outline:plus-circle</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Catálogo de Widgets Ganaderos</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Selecciona los componentes para armar tu tablero</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1.5}>
          {AVAILABLE_WIDGETS.map((widget) => {
            const isAlreadyAdded = existingWidgetIds.includes(widget.id);

            return (
              <Paper
                key={widget.id}
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  bgcolor: isAlreadyAdded ? 'action.hover' : 'background.paper',
                  borderColor: isAlreadyAdded ? 'transparent' : 'divider',
                  opacity: isAlreadyAdded ? 0.75 : 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', color: 'primary.main', flexShrink: 0 }}>
                    <FuseSvgIcon size={20}>{widget.icon}</FuseSvgIcon>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{widget.title}</Typography>
                      <Chip label={widget.category} size="small" sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>{widget.desc}</Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant={isAlreadyAdded ? 'outlined' : 'contained'}
                  color="primary"
                  disabled={isAlreadyAdded}
                  onClick={() => {
                    onAddWidget({ id: `${widget.id}_${Date.now()}`, type: widget.type, title: widget.title });
                    onClose();
                  }}
                  sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700, minWidth: 85 }}
                >
                  {isAlreadyAdded ? 'Agregado' : '+ Añadir'}
                </Button>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>

      <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '6px', fontWeight: 600 }}>Cerrar</Button>
      </Box>
    </Dialog>
  );
};

export default AddWidgetDialog;

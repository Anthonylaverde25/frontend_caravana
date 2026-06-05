import { Box, Typography, FormControl, Select, MenuItem, Stack } from '@mui/material';
import { AltRouteOutlined as RouteIcon, AssignmentOutlined as OrderIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';

interface Rep01SidebarProps {
  farmId?: number;
  emptyDestinationBatchId: number | null;
  setEmptyDestinationBatchId: (id: number | null) => void;
  serviceOrderId: number | null;
  onUpdateServiceOrder: (id: number | null, code: string | null) => void;
}

/**
 * Rep01Sidebar Component
 * Specific settings sidebar for REP-01 (Tacto y Ecografía) template.
 */
export const Rep01Sidebar = ({
  farmId,
  emptyDestinationBatchId,
  setEmptyDestinationBatchId,
  serviceOrderId,
  onUpdateServiceOrder
}: Rep01SidebarProps) => {
  const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
  const { data: dbServiceOrders = [], isLoading: isLoadingOrders } = useServiceOrders();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <OrderIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          Orden de Servicio
        </Typography>
        <FormControl fullWidth size="small" error={!serviceOrderId}>
          <Select
            value={serviceOrderId ?? ''}
            onChange={(e) => {
              const selectedId = e.target.value ? Number(e.target.value) : null;
              const selectedSo = dbServiceOrders.find((so: any) => so.id === selectedId);
              onUpdateServiceOrder(selectedId, selectedSo ? selectedSo.code : null);
            }}
            sx={{ borderRadius: 2 }}
            displayEmpty
          >
            <MenuItem value="">
              <em>Seleccionar Orden...</em>
            </MenuItem>
            {isLoadingOrders ? (
              <MenuItem disabled>Cargando órdenes...</MenuItem>
            ) : (
              dbServiceOrders.map((so: any) => (
                <MenuItem key={so.id} value={so.id}>
                  {so.code} ({so.service_type})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <RouteIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          Lote de Destino (Vacas Vacías)
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={emptyDestinationBatchId ?? ''}
            onChange={(e) => setEmptyDestinationBatchId(e.target.value ? Number(e.target.value) : null)}
            sx={{ borderRadius: 2 }}
            displayEmpty
          >
            <MenuItem value="">
              <em>Sin cambio de lote (Permanecer)</em>
            </MenuItem>
            {isLoadingBatches ? (
              <MenuItem disabled>Cargando lotes...</MenuItem>
            ) : (
              dbBatches.map((batch: any) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      {/* Explication Warning Box */}
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
          border: '1px dashed',
          borderColor: (theme) => alpha(theme.palette.warning.main, 0.2)
        }}
      >
        <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <RouteIcon sx={{ fontSize: 14 }} />
          Desvío Automático
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary', lineHeight: 1.5 }}>
          Al habilitar esta opción, los vientres detectados como <b>Vacías</b> en el OCR de la planilla se trasladarán automáticamente a este lote de destino al procesar la importación.
        </Typography>
      </Box>
    </Stack>
  );
};

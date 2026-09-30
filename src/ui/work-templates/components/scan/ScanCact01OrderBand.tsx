import React from 'react';
import { Alert, Box, CircularProgress, Stack, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TransferOrderStatusChip, {
  useTransferOrderStatusColor
} from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import type { Cact01TransferOrderState } from '../../hooks/useCact01TransferOrder';

interface ScanCact01OrderBandProps {
  state: Cact01TransferOrderState;
  /** The source batch chosen on screen, to say so when it is not the order's. */
  sourceBatchId: number | null;
}

/**
 * The order the sheet names, resolved: its code, its batch and how many head it ordered —
 * which is what the rows of this sheet are measured against.
 *
 * A sheet without a code was printed blank and filled at the chute: confirming it creates its
 * order, and that is announced before it happens. A code that finds nothing may be a misreading,
 * so it is said out loud: the operator either corrects it or asks, with the confirm button, for
 * a new order to be generated from the paper.
 */
export const ScanCact01OrderBand: React.FC<ScanCact01OrderBandProps> = ({ state, sourceBatchId }) => {
  const colors = useTransferOrderStatusColor();

  if (!state.code) {
    return (
      <Alert severity="info" sx={{ mx: 2, mt: 1.5, borderRadius: '6px' }}>
        Esta planilla no trae orden de transferencia: se imprimió en blanco y se llenó en la manga. Al confirmar se
        crea una orden con lo que dice el papel y se le asigna un código.
      </Alert>
    );
  }

  if (state.isLoading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1 }}>
        <CircularProgress size={14} />
        <Typography variant="caption" color="text.secondary">
          Buscando la orden {state.code}…
        </Typography>
      </Stack>
    );
  }

  if (state.isNotFound || !state.order) {
    return (
      <Alert severity="warning" sx={{ mx: 2, mt: 1.5, borderRadius: '6px' }}>
        La planilla trae el código de orden <b>{state.code}</b> y no existe ninguna orden con ese código. Si fue un
        error de lectura, corregilo en el encabezado. Si no, usá <b>Obtener orden de transferencia</b>: se genera una
        orden con lo que dice el papel, su código queda en el encabezado y después confirmás el movimiento contra
        ella. El botón se habilita cuando la planilla no tiene errores (lote de origen, actividad y destinos).
      </Alert>
    );
  }

  const order = state.order;
  const color = colors[order.status];
  const otherBatch = sourceBatchId != null && sourceBatchId !== order.source_batch.id;

  return (
    <Box sx={{ px: 2, pt: 1.5 }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: '8px',
          border: `1px solid ${alpha(color, 0.4)}`,
          borderLeft: `4px solid ${color}`,
          bgcolor: alpha(color, 0.05)
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
          <FuseSvgIcon size={18} sx={{ color }}>
            heroicons-outline:clipboard-document-check
          </FuseSvgIcon>
          <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
            ORDEN {order.code}
          </Typography>
          <TransferOrderStatusChip status={order.status} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Lote {order.source_batch.name} · {order.planned_head_count} cabezas ordenadas
          </Typography>
          {order.moved_head_count > 0 && (
            <Typography variant="body2" color="text.secondary">
              · ya movidas {order.moved_head_count}, faltan {order.pending_head_count}
            </Typography>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Destino {order.destination_activity.name}
          {order.destination_mode === 'single' ? ` → ${order.destinations[0]?.label ?? ''}` : ` · ${order.destinations.length} destino(s) declarados`}
          . Lo que la orden ya declaró se toma de ella; sólo se pregunta lo que dejó para la manga.
        </Typography>
      </Box>

      {!order.is_open && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: '6px' }}>
          La orden {order.code} está {order.status_label.toLowerCase()}: no admite más movimientos. Si esta planilla ya se
          cargó, no hace falta cargarla de nuevo.
        </Alert>
      )}
      {order.is_open && otherBatch && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: '6px' }}>
          La orden es del lote {order.source_batch.name}, pero el lote de origen elegido es otro. La carga se rechaza
          hasta que coincidan.
        </Alert>
      )}
    </Box>
  );
};

export default ScanCact01OrderBand;

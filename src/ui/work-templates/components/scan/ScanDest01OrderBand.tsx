import React from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import type { Dest01WeaningOrderState } from '../../hooks/useDest01WeaningOrder';

/**
 * The weaning order the sheet names, resolved. A sheet without a code was printed blank: confirming
 * it creates its order, and that is said before it happens. A code that finds nothing may be a
 * misreading, so it is said out loud and blocks until it is corrected or erased.
 */
export const ScanDest01OrderBand: React.FC<{ state: Dest01WeaningOrderState }> = ({ state }) => {
  if (!state.code) {
    return (
      <Alert severity="info" sx={{ mx: 2, mt: 1.5, borderRadius: '6px' }}>
        Esta planilla no trae orden de destete: se imprimió en blanco y se llenó en la manga. Al confirmar se crea
        una orden con lo que dice el papel, ya ejecutada, y se le asigna un código.
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

  if (!state.order) {
    return (
      <Alert severity="error" sx={{ mx: 2, mt: 1.5, borderRadius: '6px' }}>
        La planilla trae el código <strong>{state.code}</strong> y no existe ninguna orden de destete con ese código.
        Corregí la lectura en el encabezado, o borralo si la planilla se llenó sin orden.
      </Alert>
    );
  }

  const order = state.order;

  return (
    <Box sx={{ mx: 2, mt: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '6px' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{order.code}</Typography>
        <TransferOrderStatusChip status={order.status} />
        <Typography variant="body2" color="text.secondary">
          {order.pending_head_count} de {order.planned_head_count} crías por destetar ·{' '}
          {order.destination_mode === 'single' ? 'un lote para todas' : 'lote por cría'} · categoría:{' '}
          {order.category_mode_label.toLowerCase()}
          {order.weaning_type_label ? ` · destete ${order.weaning_type_label.toLowerCase()}` : ''}
        </Typography>
      </Stack>
      {!order.is_open && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {order.is_editable
            ? 'La orden es un borrador: hay que emitirla antes de ejecutarla.'
            : `La orden está ${order.status_label.toLowerCase()}: no admite más destetes.`}
        </Typography>
      )}
    </Box>
  );
};

export default ScanDest01OrderBand;

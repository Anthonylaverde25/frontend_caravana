import React from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress, Stack, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TransferOrderStatusChip, { useTransferOrderStatusColor } from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import { sheetUrl } from '@/ui/birth-orders/components/birthOrderFormat';
import type { Par01BirthOrderState } from '../../hooks/usePar01BirthOrder';

interface ScanPar01OrderBandProps {
  order: Par01BirthOrderState;
  /** "Obtener orden de parición": generates the order from the sheet and writes its code in the header. */
  onObtainOrder: () => void;
  isObtaining: boolean;
  isSaving: boolean;
}

/**
 * The birth order the sheet names, resolved. A sheet without a code is said out loud: it can get its
 * order now — with every female on the paper, so the same sheet is loaded again on later rounds —
 * or have one created on confirming, which only serves this load. Once there is an order, its sheet
 * is one click away.
 */
export const ScanPar01OrderBand: React.FC<ScanPar01OrderBandProps> = ({ order, onObtainOrder, isObtaining, isSaving }) => {
  const colors = useTransferOrderStatusColor();

  if (!order.code) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: '6px', alignItems: 'center' }}
        action={
          <Button
            size="small"
            variant="contained"
            color="warning"
            disabled={isSaving || isObtaining}
            startIcon={isObtaining ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
            onClick={onObtainOrder}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', whiteSpace: 'nowrap' }}
          >
            {isObtaining ? 'Generando orden…' : 'Obtener orden de parición'}
          </Button>
        }
      >
        <AlertTitle sx={{ fontWeight: 700 }}>La planilla no trae número de orden de parición</AlertTitle>
        Obtené la orden ahora: se genera con todas las hembras de la hoja, su código queda en el encabezado y la misma planilla se
        puede volver a cargar en las próximas recorridas. Si confirmás sin orden, se crea una registrada que sirve sólo para esta carga.
      </Alert>
    );
  }

  if (order.isLoading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={14} />
        <Typography variant="caption" color="text.secondary">
          Buscando la orden {order.code}…
        </Typography>
      </Stack>
    );
  }

  if (!order.order) {
    return (
      <Alert severity="error" sx={{ borderRadius: '6px' }}>
        La planilla trae el código <strong>{order.code}</strong> y no existe ninguna orden de parición con ese código. Corregí la lectura en el
        encabezado, o borralo si la planilla se llenó sin orden.
      </Alert>
    );
  }

  const found = order.order;
  const color = colors[found.status];

  return (
    <Box>
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
          <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}>ORDEN {found.code}</Typography>
          <TransferOrderStatusChip status={found.status} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {found.pending_head_count} de {found.head_count} vientres pendientes
            {found.overdue_head_count > 0 ? ` · ${found.overdue_head_count} con parto vencido` : ''}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            size="small"
            variant="outlined"
            href={sheetUrl(found.id)}
            target="_blank"
            rel="noopener"
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
          >
            Imprimir planilla
          </Button>
        </Stack>
      </Box>
      {!found.is_open && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: '6px' }}>
          La orden {found.code} está {found.status_label.toLowerCase()}: no admite más partos.
        </Alert>
      )}
    </Box>
  );
};

export default ScanPar01OrderBand;

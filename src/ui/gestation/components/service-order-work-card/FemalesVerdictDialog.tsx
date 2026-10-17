import type { ComponentProps } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrderFemalesVerdictTable from './ServiceOrderFemalesVerdictTable';

interface FemalesVerdictDialogProps {
  open: boolean;
  onClose: () => void;
  order: ServiceOrder;
  batchName: string;
  caravans: ComponentProps<typeof ServiceOrderFemalesVerdictTable>['caravans'];
}

/** The females of an order with their verdict, opened from a tray card (a card in a grid cannot expand). */
export default function FemalesVerdictDialog({ open, onClose, order, batchName, caravans }: FemalesVerdictDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Vientres ({order.female_caravan_ids.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.code} · {batchName}
          </Typography>
        </Box>
        <IconButton aria-label="Cerrar" onClick={onClose} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>
      <ServiceOrderFemalesVerdictTable order={order} caravans={caravans} />
    </Dialog>
  );
}

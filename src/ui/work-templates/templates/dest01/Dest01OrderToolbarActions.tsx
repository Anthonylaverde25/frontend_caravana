import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrder';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import WeaningOrderIssueDialog from '@/ui/weaning-orders/components/WeaningOrderIssueDialog';
import { useDest01Print } from './Dest01PrintContext';

/**
 * The weaning order behind the sheet, in the toolbar: its code and its CURRENT status. A draft can be
 * issued from here; once issued the sheet reloads with its code and printing unlocks.
 */
export const Dest01OrderToolbarActions: React.FC = () => {
  const { mode, weaningOrderId } = useDest01Print();
  const { data: order } = useWeaningOrder(mode === 'from_order' ? weaningOrderId : null);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  if (!order) return null;

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 0.5 }}>
        <Box sx={{ textAlign: 'right', lineHeight: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.2 }}>
            {order.code}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            {order.pending_head_count} de {order.planned_head_count} crías por destetar
          </Typography>
        </Box>
        <TransferOrderStatusChip status={order.status} />
      </Stack>

      {order.is_editable && (
        <Button
          variant="contained"
          disableElevation
          onClick={() => setIsIssueOpen(true)}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 36, px: 2, bgcolor: '#107e3e', '&:hover': { bgcolor: '#0d6832' } }}
        >
          Aprobar y emitir
        </Button>
      )}

      <WeaningOrderIssueDialog order={isIssueOpen ? order : null} onClose={() => setIsIssueOpen(false)} />
    </>
  );
};

export default Dest01OrderToolbarActions;

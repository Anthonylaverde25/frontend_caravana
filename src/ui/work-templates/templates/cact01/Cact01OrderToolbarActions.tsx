import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferOrder } from '@/features/transfer-orders/hooks/useTransferOrder';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import TransferOrderIssueDialog from '@/ui/transfer-orders/components/TransferOrderIssueDialog';
import { useCact01Print } from './Cact01PrintContext';

/**
 * The transfer order behind the sheet, in the toolbar: its code and its CURRENT status, read from
 * the server rather than remembered from when the view opened.
 *
 * A draft can be approved and issued from here, after the same confirmation the list uses. Once
 * issued, the sheet reloads with its code and printing unlocks; nothing else on this view
 * changes an order.
 */
export const Cact01OrderToolbarActions: React.FC = () => {
  const { transferOrderId } = useCact01Print();
  const { data: order } = useTransferOrder(transferOrderId);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  if (!order) return null;

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 0.5 }}>
        <Box sx={{ textAlign: 'right', lineHeight: 1 }}>
          <Typography
            sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.2 }}
          >
            {order.code}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            {order.planned_head_count} cab. · {order.destination_activity.name}
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
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '6px',
            height: 36,
            px: 2,
            bgcolor: '#107e3e',
            '&:hover': { bgcolor: '#0d6832' }
          }}
        >
          Aprobar y emitir
        </Button>
      )}

      <TransferOrderIssueDialog order={isIssueOpen ? order : null} onClose={() => setIsIssueOpen(false)} />
    </>
  );
};

export default Cact01OrderToolbarActions;

import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useConfirmEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import EntryOrderStatusChip from '@/ui/entry-orders/components/EntryOrderStatusChip';
import { useIng02Print } from './Ing02PrintContext';

/**
 * The entry order behind the sheet, in the toolbar: its code and its current status. A draft can be
 * confirmed from here; the sheet then reloads with its code and printing unlocks.
 */
export const Ing02OrderToolbarActions: React.FC = () => {
  const { mode, entryOrderId } = useIng02Print();
  const { data: order } = useEntryOrder(mode === 'from_order' ? entryOrderId : null);
  const confirm = useConfirmEntryOrder();

  if (!order) return null;

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 0.5 }}>
        <Box sx={{ textAlign: 'right', lineHeight: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', lineHeight: 1.2 }}>{order.code}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            {order.entered_count} de {order.head_count} cabezas ingresadas
          </Typography>
        </Box>
        <EntryOrderStatusChip status={order.status} />
      </Stack>

      {order.is_editable && (
        <Button
          variant="contained"
          disableElevation
          disabled={confirm.isPending}
          onClick={() => confirm.mutate(order.id)}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 36, px: 2, bgcolor: '#107e3e', '&:hover': { bgcolor: '#0d6832' } }}
        >
          Confirmar compra
        </Button>
      )}
    </>
  );
};

export default Ing02OrderToolbarActions;

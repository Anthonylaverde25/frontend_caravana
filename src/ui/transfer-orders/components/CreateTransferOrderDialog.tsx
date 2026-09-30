import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferOrders } from '@/features/transfer-orders/hooks/useTransferOrders';
import type { TransferOrderSummary } from '@/features/transfer-orders/types';
import {
  buildTransferPrefillQuery,
  TransferPrefillDestination
} from '@/ui/activities/components/transfer/transferPrefill';
import { useTransferOrderFormOptions } from '../hooks/useTransferOrderFormOptions';
import TransferOrderSourceFields from './create/TransferOrderSourceFields';
import TransferOrderDestinationFields from './create/TransferOrderDestinationFields';

interface CreateTransferOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Pre-builds a transfer order: source activity and batch, destination activity and batch. The
 * animals are still chosen on the transfer screen of the source batch, which opens with this
 * destination already set. It creates nothing.
 *
 * A batch holds one active order at a time (draft, issued or partial). The backend refuses a
 * second one; this dialog only says so before the user gets that far.
 */
export const CreateTransferOrderDialog: React.FC<CreateTransferOrderDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { sourceActivities, destinationActivities } = useTransferOrderFormOptions();

  const [sourceActivityId, setSourceActivityId] = useState<number | ''>('');
  const [sourceBatchId, setSourceBatchId] = useState<number | ''>('');
  const [destinationActivityId, setDestinationActivityId] = useState<number | ''>('');
  const [destination, setDestination] = useState<TransferPrefillDestination | null>(null);

  useEffect(() => {
    if (!open) return;

    setSourceActivityId('');
    setSourceBatchId('');
    setDestinationActivityId('');
    setDestination(null);
  }, [open]);

  const { data: batchOrders = [], isFetching } = useTransferOrders({ sourceBatchId: sourceBatchId || null });
  const isCheckingOrders = sourceBatchId !== '' && isFetching;
  const activeOrder =
    sourceBatchId === ''
      ? null
      : (batchOrders.find(
          (order) => order.source_batch.id === sourceBatchId && (order.is_open || order.is_editable)
        ) ?? null);

  const changeSourceActivity = (activityId: number | '') => {
    setSourceActivityId(activityId);
    setSourceBatchId('');
  };

  const changeSourceBatch = (batchId: number | '') => {
    setSourceBatchId(batchId);

    // A batch cannot be its own destination.
    if (destination?.kind === 'existing' && destination.batchId === batchId) setDestination(null);
  };

  const changeDestinationActivity = (activityId: number | '') => {
    setDestinationActivityId(activityId);
    setDestination(null);
  };

  const openActiveOrder = (order: TransferOrderSummary) => {
    onClose();
    navigate(`/activities/batches/${order.source_batch.id}/transfer?orderId=${order.id}`);
  };

  const canProceed =
    sourceBatchId !== '' && destinationActivityId !== '' && destination != null && !activeOrder && !isCheckingOrders;

  const proceed = () => {
    if (!canProceed) return;

    const query = buildTransferPrefillQuery({ destinationActivityId, destination });

    onClose();
    navigate(`/activities/batches/${sourceBatchId}/transfer?${query}`);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Nueva orden de transferencia
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TransferOrderSourceFields
          activities={sourceActivities}
          activityId={sourceActivityId}
          onActivityChange={changeSourceActivity}
          batchId={sourceBatchId}
          onBatchChange={changeSourceBatch}
          activeOrder={activeOrder}
          isCheckingOrders={isCheckingOrders}
          onOpenActiveOrder={openActiveOrder}
        />

        <Divider />

        <TransferOrderDestinationFields
          activities={destinationActivities}
          activityId={destinationActivityId}
          onActivityChange={changeDestinationActivity}
          destination={destination}
          onDestinationChange={setDestination}
          sourceBatchId={sourceBatchId}
        />

        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          En la transferencia del lote elegís los animales y guardás la orden como borrador o la creás emitida.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!canProceed}
          onClick={proceed}
          endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', '&.Mui-disabled': { opacity: 0.45 } }}
        >
          Armar la orden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTransferOrderDialog;

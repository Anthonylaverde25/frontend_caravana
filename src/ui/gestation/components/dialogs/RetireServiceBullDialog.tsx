import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { useRetireServiceBull } from '@/features/gestation/hooks/useSanitaryExposureAlerts';
import ReplacementReasonSelector from './replace-bull/ReplacementReasonSelector';
import ReplacementDestinationStep from './replace-bull/ReplacementDestinationStep';

interface RetireServiceBullDialogProps {
  open: boolean;
  onClose: () => void;
  bull: { id: number; identification: string } | null;
  order: { id: number; code: string; batch_id?: number | null } | null;
  batches: Batch[];
  /** Preselected reason, e.g. SANITARY_REJECTION when opened from an exposure alert. */
  defaultReason?: string;
  onSuccess?: () => void;
}

/**
 * Takes a bull out of a running service without bringing another one in: there may be no spare
 * bull when he must leave at once. Reuses the reason and destination pieces of the replacement.
 */
export const RetireServiceBullDialog: React.FC<RetireServiceBullDialogProps> = ({
  open,
  onClose,
  bull,
  order,
  batches,
  defaultReason = 'LAMENESS_FOOT',
  onSuccess,
}) => {
  const [reason, setReason] = useState(defaultReason);
  const [destinationBatchId, setDestinationBatchId] = useState<number | null>(null);
  const [retirementDate, setRetirementDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const { mutate: retire, isPending } = useRetireServiceBull();

  const destinationBatches = useMemo(
    () => batches.filter((b) => b.isActive() && !b.provider_id && !b.is_system && b.id !== order?.batch_id),
    [batches, order?.batch_id]
  );
  const defaultDestination = useMemo(
    () => destinationBatches.find((b) => b.name.toLowerCase().includes('toro')) || destinationBatches[0] || null,
    [destinationBatches]
  );

  useEffect(() => {
    if (open) {
      setReason(defaultReason);
      setDestinationBatchId(defaultDestination?.id ?? null);
      setRetirementDate(new Date().toISOString().slice(0, 16));
      setNotes('');
    }
  }, [open, defaultReason, defaultDestination]);

  if (!bull || !order) return null;

  const handleSubmit = () => {
    retire(
      {
        serviceOrderId: order.id,
        maleCaravanId: bull.id,
        retirementDate,
        reason,
        destinationBatchId: reason === 'DEATH' ? null : destinationBatchId,
        notes,
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Retirar {bull.identification} sin reemplazo
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Orden {order.code}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
            La orden sigue abierta con los demás toros. Si era el último, agregue uno o cierre el servicio.
          </Alert>
          <ReplacementReasonSelector selectedReason={reason} onSelectReason={setReason} />
          <ReplacementDestinationStep
            batches={destinationBatches}
            destinationBatchId={destinationBatchId}
            onDestinationBatchChange={setDestinationBatchId}
            defaultDonorBatch={defaultDestination}
            reason={reason}
            replacementDate={retirementDate}
            onReplacementDateChange={setRetirementDate}
            notes={notes}
            onNotesChange={setNotes}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="text" onClick={onClose} disabled={isPending} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending}
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          {isPending ? 'Retirando...' : 'Retirar toro'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RetireServiceBullDialog;

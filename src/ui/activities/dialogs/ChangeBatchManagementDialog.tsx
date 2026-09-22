import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useChangeBatchManagement } from '@/features/batches/hooks/useChangeBatchManagement';
import { ActivityBatch } from '@/core/activities/domain/entities/Activity';
import ManagementSystemSelector from '@/ui/batches/components/create/ManagementSystemSelector';
import { declaresManagementSystem } from '../components/production-sheet/managementSystem';

interface ChangeBatchManagementDialogProps {
  open: boolean;
  onClose: () => void;
  batch: (ActivityBatch & { activityCode?: string }) | null;
}

/**
 * Changes the management system of an existing batch.
 *
 * The two axes are orthogonal: a batch of replacement females can winter in a pen
 * without ceasing to be a batch of replacement females, so changing the feeding
 * regime moves no animals and leaves the type and the activity untouched.
 */
export default function ChangeBatchManagementDialog({
  open,
  onClose,
  batch
}: ChangeBatchManagementDialogProps) {
  const { mutate, isPending } = useChangeBatchManagement();
  const [isConfined, setIsConfined] = useState<boolean | undefined>(undefined);

  // Only preselect what was actually declared. For a batch whose management system
  // nobody ever stated, the dialog opens empty so that saving is a declaration and
  // not the confirmation of a default the system invented.
  useEffect(() => {
    if (open && batch) {
      setIsConfined(
        declaresManagementSystem(batch) ? (batch.isConfined ?? undefined) : undefined
      );
    }
  }, [open, batch?.id, batch?.isConfined]);

  if (!batch) return null;

  const wasDeclared = declaresManagementSystem(batch);
  const hasChanged = isConfined !== undefined && (!wasDeclared || isConfined !== batch.isConfined);

  const handleSubmit = () => {
    if (!hasChanged || isConfined === undefined) return;

    mutate({ id: batch.id, isConfined }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
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
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Sistema de Manejo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {batch.name}
            {batch.batchTypeName ? ` · ${batch.batchTypeName}` : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <ManagementSystemSelector value={isConfined} onChange={setIsConfined} />

          <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0.5 }}>
            Cambiar de alimentación no es un movimiento de hacienda: el lote, su tipo, su
            actividad, sus animales y sus pesos quedan intactos.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
      >
        <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasChanged || isPending}
          variant="contained"
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}
        >
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

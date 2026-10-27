import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useVoidInsemination } from '@/features/gestation/hooks/useInseminations';
import type { Insemination } from '@/features/gestation/types/insemination';
import { formatDay } from '../../utils/reproductiveVerdict';

interface VoidInseminationDialogProps {
  orderId: number;
  insemination: Insemination;
  onClose: () => void;
}

/** "Anular inseminación" (IA9): only the reason. The straws go back and the rest of its load is reissued. */
export default function VoidInseminationDialog({ orderId, insemination, onClose }: VoidInseminationDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const mutation = useVoidInsemination();
  const [reason, setReason] = useState('');

  const confirm = () => {
    if (reason.trim() === '') {
      enqueueSnackbar('Indicá el motivo de la anulación.', { variant: 'warning' });
      return;
    }
    mutation.mutate(
      { orderId, inseminationId: insemination.id, reason: reason.trim(), idempotencyKey: crypto.randomUUID() },
      {
        onSuccess: () => {
          enqueueSnackbar('Inseminación anulada: las pajuelas volvieron al termo.', { variant: 'success' });
          onClose();
        },
        onError: (error: any) => enqueueSnackbar(error?.response?.data?.message ?? 'No se pudo anular.', { variant: 'error' }),
      }
    );
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <DialogTitle sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Anular inseminación</Typography>
        <IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ pt: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {insemination.identification} · {formatDay(insemination.inseminated_on)} · {insemination.sire_name ?? insemination.item_name} ·{' '}
            {insemination.lot_code ?? 'sin identificar'} · {insemination.straws_used} pajuela(s)
          </Typography>
          <TextField label="Motivo" fullWidth variant="filled" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus InputProps={{ sx: { bgcolor: 'action.hover' } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="text" onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={confirm}
          disabled={mutation.isPending}
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Anular
        </Button>
      </DialogActions>
    </Dialog>
  );
}

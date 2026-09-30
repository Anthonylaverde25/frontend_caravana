import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface TransferOrderReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string | null) => void;
  isPending?: boolean;
  title: string;
  /** What happens once confirmed, in one or two sentences. */
  explanation: string;
  confirmLabel: string;
  code: string;
  /**
   * Discarding a draft needs no reason — nothing was committed — so it can be left blank.
   * Cancelling an issued order and closing one incomplete always ask for it.
   */
  reasonRequired?: boolean;
}

const MIN_REASON = 3;

/**
 * Cancelling an order and closing it incomplete both demand a reason, because the reason is what
 * the history keeps: six months later "ANULADA" alone says nothing. Discarding a draft offers the
 * field without demanding it.
 */
export const TransferOrderReasonDialog: React.FC<TransferOrderReasonDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isPending = false,
  title,
  explanation,
  confirmLabel,
  code,
  reasonRequired = true
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const isValid = reasonRequired ? reason.trim().length >= MIN_REASON : true;

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          {title} · <Box component="span" sx={{ fontFamily: 'monospace' }}>{code}</Box>
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="warning" sx={{ borderRadius: '6px', fontSize: '0.82rem' }}>
          {explanation}
        </Alert>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          variant="filled"
          label={reasonRequired ? 'Motivo (obligatorio)' : 'Motivo (opcional)'}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          helperText="Queda en el historial de la orden."
          InputProps={{ disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} disabled={isPending} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="error"
          disableElevation
          disabled={!isValid || isPending}
          onClick={() => onConfirm(reason.trim() || null)}
          startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferOrderReasonDialog;

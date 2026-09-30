import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface RegisterTransferSummary {
  sourceName: string;
  destinationName: string;
  headCount: number;
  movementDate: string;
  isToday: boolean;
  responsable: string | null;
  /** "3 pesos, 1 categoría", or null when nothing measured at the chute changes. */
  fieldChanges: string | null;
}

interface ConfirmRegisterTransferDialogProps {
  open: boolean;
  summary: RegisterTransferSummary | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');

  return `${day}/${month}/${year}`;
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {value}
    </Typography>
  </Box>
);

/**
 * The last look before the animals change batch. Registering moves them at once and cannot be
 * undone from here, so the date is repeated when it is not today.
 */
export const ConfirmRegisterTransferDialog: React.FC<ConfirmRegisterTransferDialogProps> = ({
  open,
  summary,
  isPending,
  onClose,
  onConfirm
}) => (
  <Dialog
    open={open}
    onClose={isPending ? undefined : onClose}
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
      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
        Registrar transferencia
      </Typography>
      <IconButton onClick={onClose} size="small" disabled={isPending} sx={{ color: 'primary.main' }}>
        <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
      </IconButton>
    </Box>

    {summary && (
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={1.25}>
          <Row label="Origen" value={summary.sourceName} />
          <Row label="Destino" value={summary.destinationName} />
          <Row label="Animales" value={`${summary.headCount} cab.`} />
          <Row label="Fecha del movimiento" value={formatDate(summary.movementDate)} />
          {summary.responsable && <Row label="Responsable" value={summary.responsable} />}
          {summary.fieldChanges && <Row label="Datos de campo" value={summary.fieldChanges} />}
        </Stack>

        <Alert
          severity={summary.isToday ? 'info' : 'warning'}
          sx={{ mt: 2.5, fontSize: '0.78rem', py: 0.5, '& .MuiAlert-message': { lineHeight: 1.35 } }}
        >
          {summary.isToday
            ? 'Los animales cambian de lote ahora y la orden queda ejecutada.'
            : `Se registra con fecha ${formatDate(summary.movementDate)}, no con la de hoy. Los animales cambian de lote ahora y la orden queda ejecutada.`}
        </Alert>
      </DialogContent>
    )}

    <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
      <Button onClick={onClose} disabled={isPending} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
        Volver
      </Button>
      <Button
        variant="contained"
        disableElevation
        onClick={onConfirm}
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
      >
        Registrar
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmRegisterTransferDialog;

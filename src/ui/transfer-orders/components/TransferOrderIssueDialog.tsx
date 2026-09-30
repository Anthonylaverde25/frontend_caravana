import React from 'react';
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
  Stack,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { TransferOrderSummary } from '@/features/transfer-orders/types';
import { useIssueTransferOrder } from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import TransferOrderStatusChip from './TransferOrderStatusChip';

interface TransferOrderIssueDialogProps {
  /** The draft to issue; null keeps the dialog closed. */
  order: TransferOrderSummary | null;
  onClose: () => void;
}

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  </Box>
);

/**
 * Draft → issued, from the list. Shown before acting because issuing is the moment the order
 * starts committing animals: what it orders is laid out so the confirmation is about something
 * the user can see, not about a code.
 *
 * If the server refuses (an animal already taken by another open order, or no longer in the
 * batch) the dialog stays open with the reason, so the user knows which draft needs work.
 */
export const TransferOrderIssueDialog: React.FC<TransferOrderIssueDialogProps> = ({ order, onClose }) => {
  const issue = useIssueTransferOrder();

  const destinations =
    order?.destination_mode === 'single'
      ? (order.destinations[0]?.label ?? '—')
      : `${order?.destinations.length ?? 0} destino(s)${order && order.unassigned_head_count > 0 ? ` · ${order.unassigned_head_count} se deciden en la manga` : ''}`;

  const close = () => {
    issue.reset();
    onClose();
  };

  const confirm = () => {
    if (!order) return;

    issue.mutate(order.id, { onSuccess: close });
  };

  const error = (issue.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;

  return (
    <Dialog
      open={order !== null}
      onClose={issue.isPending ? undefined : close}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Emitir orden · <Box component="span" sx={{ fontFamily: 'monospace' }}>{order?.code}</Box>
        </Typography>
        <IconButton size="small" onClick={close} disabled={issue.isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      {order && (
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TransferOrderStatusChip status="DRAFT" />
            <FuseSvgIcon size={16} color="action">
              heroicons-outline:arrow-right
            </FuseSvgIcon>
            <TransferOrderStatusChip status="ISSUED" />
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
            <Fact label="Lote de origen">{order.source_batch.name}</Fact>
            <Fact label="Cabezas">{order.planned_head_count}</Fact>
            <Fact label="Actividad">
              {order.source_activity_name ?? '—'} → {order.destination_activity.name ?? '—'}
            </Fact>
            <Fact label="Destino(s)">{destinations}</Fact>
          </Box>

          <Alert severity="info" sx={{ borderRadius: '6px', fontSize: '0.82rem' }}>
            Al emitirla, la orden compromete estos animales: ninguna otra orden podrá tomarlos, la planilla se
            puede imprimir y la orden se puede ejecutar. Ya no se edita; para cambiarla habrá que anularla.
          </Alert>

          {error && (
            <Alert severity="error" sx={{ borderRadius: '6px', fontSize: '0.82rem' }}>
              {error}
            </Alert>
          )}
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={close} disabled={issue.isPending} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Volver
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={confirm}
          disabled={issue.isPending}
          startIcon={
            issue.isPending ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
            )
          }
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Emitir orden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferOrderIssueDialog;

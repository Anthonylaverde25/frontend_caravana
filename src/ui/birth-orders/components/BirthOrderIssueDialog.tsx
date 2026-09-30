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
import type { BirthOrderSummary } from '@/features/birth-orders/types';
import { useIssueBirthOrder } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import { periodOf, sourcesOf } from './birthOrderFormat';

interface BirthOrderIssueDialogProps {
  order: BirthOrderSummary | null;
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
 * Draft → issued. Shown before acting because issuing is the moment the order starts holding its
 * females. If the server refuses (a female no longer pregnant, or in another open birth order) the
 * dialog stays open with the reason.
 */
export const BirthOrderIssueDialog: React.FC<BirthOrderIssueDialogProps> = ({ order, onClose }) => {
  const issue = useIssueBirthOrder();

  const close = () => {
    issue.reset();
    onClose();
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
          Emitir orden de parición ·{' '}
          <Box component="span" sx={{ fontFamily: 'monospace' }}>
            {order?.code}
          </Box>
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
            <Fact label="Vientres">{order.planned_head_count}</Fact>
            <Fact label="Lote(s)">{sourcesOf(order)}</Fact>
            <Fact label="Período">{periodOf(order)}</Fact>
            <Fact label="Destino de las crías">El lote de su madre</Fact>
          </Box>

          <Alert severity="info" sx={{ borderRadius: '6px', fontSize: '0.82rem' }}>
            Al emitirla, ninguna otra orden de parición podrá tomar estos vientres, la planilla PAR-01 se puede
            imprimir y la orden se cumple en una o varias recorridas. No bloquea transferencias ni destetes: la
            cría nace donde esté su madre. Ya no se edita; para cambiarla habrá que anularla.
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
          onClick={() => order && issue.mutate(order.id, { onSuccess: close })}
          disabled={issue.isPending}
          startIcon={
            issue.isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
          }
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Emitir orden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BirthOrderIssueDialog;

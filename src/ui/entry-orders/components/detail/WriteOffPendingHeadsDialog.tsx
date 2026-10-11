import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useWriteOffPendingHeads } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { EntryOrder, entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import { filledSx } from '@/ui/batches/components/external/externalFormParts';

interface WriteOffPendingHeadsDialogProps {
  order: EntryOrder;
  open: boolean;
  onClose: () => void;
}

/**
 * "Dar de baja pendientes": head received by count that will never get a caravan — they died or
 * were lost before the chute wrote it. Their batch stops counting them, they stay received, and an
 * incident keeps the reason. Picks the DTE and batch they are pending in.
 *
 * Follows "Alta Rápida de Lote" (CreateBatchDialog): sm width, one column, filled fields.
 */
export const WriteOffPendingHeadsDialog: React.FC<WriteOffPendingHeadsDialogProps> = ({ order, open, onClose }) => {
  const writeOff = useWriteOffPendingHeads();
  const options = useMemo(
    () =>
      order.dtes.flatMap((dte) =>
        dte.pending_by_batch.map((p) => ({
          key: `${dte.id}:${p.batch.id}`,
          dteId: dte.id,
          batchId: p.batch.id,
          max: p.head_count,
          label: `DTE ${dte.dte_number} · ${p.batch.name ?? `Lote #${p.batch.id}`} · ${p.head_count} por identificar`
        }))
      ),
    [order.dtes]
  );
  const [key, setKey] = useState('');
  const [count, setCount] = useState('1');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'key' | 'count' | 'reason', string>>>({});
  const picked = options.find((o) => o.key === key);

  useEffect(() => {
    if (open) {
      setKey(options.length === 1 ? options[0].key : '');
      setCount('1');
      setReason('');
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = () => {
    const head = Number(count);
    const found: typeof errors = {
      ...(picked ? {} : { key: 'Elegí de qué DTE y lote' }),
      ...(Number.isInteger(head) && head >= 1 && (!picked || head <= picked.max)
        ? {}
        : { count: picked ? `Entre 1 y ${picked.max}` : 'Al menos una' }),
      ...(reason.trim() !== '' ? {} : { reason: 'Indicá por qué se dan de baja' })
    };

    setErrors(found);

    if (Object.keys(found).length > 0 || !picked) return;

    writeOff.mutate(
      {
        id: order.id,
        payload: { dte_id: picked.dteId, batch_id: picked.batchId, head_count: head, reason: reason.trim() }
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          const body = entryOrderApiError(error);
          setErrors({
            [body?.field === 'reason' ? 'reason' : 'count']: entryOrderErrorMessage(
              error,
              'No se pudieron dar de baja'
            )
          });
        }
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={writeOff.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
        <Typography
          variant="h6"
          sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
        >
          Dar de baja cabezas por identificar
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={writeOff.isPending}
          sx={{ color: 'primary.main' }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Alert
            severity="info"
            sx={{ fontSize: '0.8rem', py: 0.5 }}
          >
            Para las cabezas que llegaron pero nunca van a tener caravana (murieron o se perdieron antes de
            caravanearlas). El lote deja de contarlas y queda una novedad con el motivo.
          </Alert>
          <TextField
            select
            label="DTE y lote"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            variant="filled"
            fullWidth
            required
            error={!!errors.key}
            helperText={errors.key}
            sx={filledSx}
          >
            {options.map((o) => (
              <MenuItem
                key={o.key}
                value={o.key}
              >
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cabezas"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            variant="filled"
            fullWidth
            required
            inputProps={{ min: 1, max: picked?.max }}
            error={!!errors.count}
            helperText={errors.count}
            sx={filledSx}
          />
          <TextField
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            variant="filled"
            fullWidth
            required
            multiline
            rows={2}
            error={!!errors.reason}
            helperText={errors.reason}
            sx={filledSx}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
      >
        <Button
          onClick={onClose}
          disabled={writeOff.isPending}
          variant="text"
          sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={submit}
          disabled={writeOff.isPending}
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 3.5,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {writeOff.isPending ? 'Guardando...' : 'Dar de baja'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WriteOffPendingHeadsDialog;

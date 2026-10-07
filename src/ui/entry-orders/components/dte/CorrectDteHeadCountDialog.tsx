import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useCorrectDteHeadCount } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage, type EntryOrderDte } from '@/features/entry-orders/types';

interface CorrectDteHeadCountDialogProps {
  orderId: number;
  /** The DTE being corrected, or null when closed. */
  dte: EntryOrderDte | null;
  onClose: () => void;
}

const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } } as const;

/**
 * "Corregir cabezas": the head of a DTE were loaded wrong. Never below what was already received
 * or declared missing on it — more animals than the paper says is an excess to settle with the
 * provider, not a loading mistake. The reason stays in the history; what the correction left
 * behind (an ING-03 issued for the old head, incidents without difference) comes back as warnings.
 */
export const CorrectDteHeadCountDialog: React.FC<CorrectDteHeadCountDialogProps> = ({ orderId, dte, onClose }) => {
  const correct = useCorrectDteHeadCount();
  const [headCount, setHeadCount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<{ field: 'head_count' | 'reason'; message: string } | null>(null);

  useEffect(() => {
    if (!dte) return;
    setHeadCount(String(dte.head_count));
    setReason('');
    setError(null);
  }, [dte?.id]);

  if (!dte) return null;

  const heads = Math.trunc(Number(headCount) || 0);

  const submit = () => {
    if (heads < Math.max(1, dte.accounted_count)) {
      setError({ field: 'head_count', message: `No puede declarar menos de ${Math.max(1, dte.accounted_count)} cabezas: ya hay ${dte.received_count} recibidas y ${dte.missing_head_count} que no llegarán.` });
      return;
    }
    if (heads === dte.head_count) {
      setError({ field: 'head_count', message: `El DTE ya declara ${dte.head_count} cabezas.` });
      return;
    }
    if (reason.trim().length < 3) {
      setError({ field: 'reason', message: 'Indicá por qué se corrigen las cabezas.' });
      return;
    }

    correct.mutate(
      { id: orderId, dteId: dte.id, payload: { head_count: heads, reason: reason.trim() } },
      {
        onSuccess: () => onClose(),
        onError: (failure) => {
          const body = entryOrderApiError(failure);
          setError({ field: body?.field === 'reason' ? 'reason' : 'head_count', message: entryOrderErrorMessage(failure, 'No se pudo corregir el DTE') });
          toast.error(entryOrderErrorMessage(failure, 'No se pudo corregir el DTE'));
        }
      }
    );
  };

  return (
    <Dialog open onClose={() => !correct.isPending && onClose()} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Corregir cabezas del DTE {dte.dte_number}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Declara {dte.head_count} · recibidas {dte.received_count} · no llegan {dte.missing_head_count} · en tránsito {dte.pending_count}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={correct.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ borderRadius: '6px', py: 0.5, fontSize: '0.8rem' }}>
            Corregí sólo un error de carga. Si llegaron más animales que los que dice el papel, eso es una novedad para el proveedor, no una corrección.
          </Alert>
          <TextField
            label="Cabezas que declara el DTE"
            type="number"
            required
            fullWidth
            variant="filled"
            value={headCount}
            onChange={(e) => {
              setHeadCount(e.target.value);
              setError(null);
            }}
            InputProps={{ disableUnderline: true }}
            inputProps={{ min: Math.max(1, dte.accounted_count) }}
            error={error?.field === 'head_count'}
            helperText={error?.field === 'head_count' ? error.message : `Mínimo ${Math.max(1, dte.accounted_count)}: lo ya recibido o declarado faltante.`}
            sx={filledSx}
          />
          <TextField
            label="Motivo"
            required
            fullWidth
            multiline
            minRows={2}
            variant="filled"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            InputProps={{ disableUnderline: true }}
            placeholder="Ej: se cargó 52 por error, el DTE dice 50"
            error={error?.field === 'reason'}
            helperText={error?.field === 'reason' ? error.message : 'Queda en el historial de la orden.'}
            sx={filledSx}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={correct.isPending} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button variant="contained" disableElevation disabled={correct.isPending} onClick={submit} sx={{ px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}>
          {correct.isPending ? 'Corrigiendo…' : 'Corregir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrectDteHeadCountDialog;

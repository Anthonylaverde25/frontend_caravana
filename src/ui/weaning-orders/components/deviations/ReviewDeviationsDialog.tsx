import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useReviewWeaningDeviations } from '@/features/weaning-orders/hooks/useWeaningDeviations';
import type { DeviationRow } from './deviationRows';

interface ReviewDeviationsDialogProps {
  /** The deviations to review, with the order code of each; empty = closed. */
  rows: (DeviationRow & { orderCode: string })[];
  onClose: () => void;
  onDone: () => void;
}

/**
 * "Revisar desvíos": somebody saw them and says why. The note is always written; it changes neither
 * the orders nor the calves, it only leaves who, when and why.
 */
export const ReviewDeviationsDialog: React.FC<ReviewDeviationsDialogProps> = ({ rows, onClose, onDone }) => {
  const review = useReviewWeaningDeviations();
  const [note, setNote] = useState('');
  const [missingNote, setMissingNote] = useState(false);
  const open = rows.length > 0;

  useEffect(() => {
    if (open) {
      setNote('');
      setMissingNote(false);
      review.reset();
    }
  }, [open]);

  // Validated on click, not by disabling the button.
  const confirm = () => {
    if (note.trim() === '') {
      setMissingNote(true);
      return;
    }

    review.mutate({ ids: rows.flatMap((r) => r.ids), note: note.trim() }, { onSuccess: onDone });
  };

  return (
    <Dialog
      open={open}
      onClose={review.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Revisar {rows.length} {rows.length === 1 ? 'desvío' : 'desvíos'}
        </Typography>
        <IconButton onClick={onClose} disabled={review.isPending} aria-label="Cerrar" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}>
          Revisar no cambia la orden ni las crías: deja constancia de quién lo miró y por qué.
        </Alert>

        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', maxHeight: 220, overflowY: 'auto' }}>
          {rows.map((row) => (
            <Stack key={row.key} direction="row" spacing={1.25} alignItems="flex-start" sx={{ px: 1.5, py: 1, '& + &': { borderTop: 1, borderColor: 'divider' } }}>
              <Chip size="small" variant="outlined" label={row.kindLabel} sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">
                  <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                    {row.title}
                  </Box>{' '}
                  · {row.orderCode}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.planned ?? '—'} →{' '}
                  <Box component="strong" sx={{ color: 'text.primary' }}>
                    {row.actual ?? '—'}
                  </Box>
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>

        <TextField
          label="Justificación"
          required
          multiline
          minRows={3}
          fullWidth
          variant="filled"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setMissingNote(false);
          }}
          error={missingNote}
          helperText={missingNote ? 'Escribí por qué está bien.' : `La misma nota queda en ${rows.length === 1 ? 'el desvío' : `los ${rows.length} desvíos`}, con tu usuario y la fecha.`}
          InputProps={{ disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={review.isPending} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={confirm}
          disabled={review.isPending}
          startIcon={review.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
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
          Marcar {rows.length} como {rows.length === 1 ? 'revisado' : 'revisados'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDeviationsDialog;

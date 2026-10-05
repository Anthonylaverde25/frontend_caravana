import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useResolveEntryOrderIncident } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderErrorMessage, type EntryOrderIncident } from '@/features/entry-orders/types';

interface ResolveIncidentDialogProps {
  orderId: number;
  incident: EntryOrderIncident | null;
  onClose: () => void;
}

/** Closes an incident with what was agreed with the provider. A resolved one is never reopened. */
export const ResolveIncidentDialog: React.FC<ResolveIncidentDialogProps> = ({ orderId, incident, onClose }) => {
  const resolve = useResolveEntryOrderIncident();
  const [resolution, setResolution] = useState('');
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (incident) {
      setResolution('');
      setMissing(false);
    }
  }, [incident]);

  const submit = () => {
    if (!incident) return;

    // Told on click, not by a disabled button: the theme paints a disabled button like an active one.
    if (resolution.trim().length < 3) {
      setMissing(true);
      return;
    }

    resolve.mutate(
      { id: orderId, incidentId: incident.id, resolution: resolution.trim() },
      { onSuccess: () => onClose(), onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo resolver la novedad')) }
    );
  };

  return (
    <Dialog open={incident != null} onClose={resolve.isPending ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Resolver novedad
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={resolve.isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="warning" icon={<FuseSvgIcon size={18}>heroicons-outline:flag</FuseSvgIcon>} sx={{ borderRadius: '6px' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {incident?.type_label}
            </Typography>
            <Typography variant="body2">{incident?.detail}</Typography>
          </Alert>
          <TextField
            autoFocus
            required
            multiline
            minRows={3}
            variant="filled"
            label="Qué se acordó con el proveedor"
            value={resolution}
            onChange={(e) => {
              setResolution(e.target.value);
              setMissing(false);
            }}
            error={missing}
            helperText={missing ? 'Escribí qué se acordó con el proveedor.' : 'Queda en el historial de la orden. Una novedad resuelta no se reabre.'}
            sx={{ bgcolor: 'action.hover' }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={onClose} disabled={resolve.isPending} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={resolve.isPending}
          onClick={submit}
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
        >
          {resolve.isPending ? 'Guardando…' : 'Resolver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResolveIncidentDialog;

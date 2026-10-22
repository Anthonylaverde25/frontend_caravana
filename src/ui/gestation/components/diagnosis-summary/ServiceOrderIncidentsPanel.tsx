import { useState } from 'react';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ServiceOrderIncident, useResolveServiceOrderIncident } from '@/features/gestation/hooks/useServiceOrders';
import { apiErrorData } from '@/ui/gestation/utils/apiError';

interface ServiceOrderIncidentsPanelProps {
  orderId: number;
  incidents: ServiceOrderIncident[];
  /** Shown outside the service screens (e.g. the assistant): the incidents are listed, not resolved. */
  readOnly?: boolean;
}

/**
 * Non-blocking facts of the order (e.g. a female found pregnant after being moved out as empty).
 * They are settled with a note; a resolved one is never reopened.
 */
export default function ServiceOrderIncidentsPanel({ orderId, incidents, readOnly = false }: ServiceOrderIncidentsPanelProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: resolve, isPending } = useResolveServiceOrderIncident();
  const [resolving, setResolving] = useState<number | null>(null);
  const [note, setNote] = useState('');

  if (incidents.length === 0) return null;

  const handleResolve = async (incidentId: number) => {
    if (note.trim() === '') {
      enqueueSnackbar('Escribí cómo se resolvió la novedad.', { variant: 'warning' });
      return;
    }
    try {
      await resolve({ orderId, incidentId, resolution: note.trim() });
      setResolving(null);
      setNote('');
      enqueueSnackbar('Novedad resuelta.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(apiErrorData(error).message || 'No se pudo resolver la novedad.', { variant: 'error' });
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Novedades</Typography>
      {incidents.map((incident) => (
        <Alert key={incident.id} severity={incident.status === 'OPEN' ? 'warning' : 'success'} sx={{ fontSize: '0.78rem' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>{incident.type_label}</Typography>
            <Chip label={incident.status_label} size="small" sx={{ height: 18, fontSize: '0.62rem' }} />
          </Stack>
          <Typography variant="caption" sx={{ display: 'block' }}>{incident.detail}</Typography>
          {incident.resolution && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
              Resolución: {incident.resolution}
            </Typography>
          )}
          {!readOnly && incident.status === 'OPEN' && resolving !== incident.id && (
            <Button size="small" onClick={() => { setResolving(incident.id); setNote(''); }} sx={{ mt: 0.5, textTransform: 'none', fontWeight: 700 }}>
              Resolver
            </Button>
          )}
          {resolving === incident.id && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                variant="filled"
                hiddenLabel
                placeholder="Cómo se resolvió"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ bgcolor: 'action.hover', flex: 1 }}
              />
              <Button size="small" variant="contained" disabled={isPending} onClick={() => handleResolve(incident.id)} sx={{ textTransform: 'none' }}>
                Guardar
              </Button>
            </Box>
          )}
        </Alert>
      ))}
    </Stack>
  );
}

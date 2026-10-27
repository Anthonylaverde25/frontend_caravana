import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useEndInseminationService } from '@/features/gestation/hooks/useInseminations';
import { todayIso } from '../../utils/reproductiveVerdict';
import NotInseminatedGrid from './NotInseminatedGrid';
import { useNotInseminated } from './useNotInseminated';

interface EndInseminationServiceDialogProps {
  order: ServiceOrder;
  onClose: () => void;
}

/**
 * "Terminar servicio" (menu, AI without repaso bulls): frees the batch before the tacto. Optional:
 * closing the order ends the service as well (DB5).
 */
export default function EndInseminationServiceDialog({ order, onClose }: EndInseminationServiceDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const mutation = useEndInseminationService();
  const notInseminated = useNotInseminated(order);
  const [endDate, setEndDate] = useState(order.insemination_summary?.last_insemination_on ?? todayIso());
  const [observations, setObservations] = useState('');

  const confirm = () =>
    mutation.mutate(
      { orderId: order.id, endDate, reasons: notInseminated.payload(), observations },
      {
        onSuccess: () => {
          enqueueSnackbar(`Servicio terminado: el lote ${order.batch_name ?? ''} queda libre para otro servicio.`, { variant: 'success' });
          onClose();
        },
        onError: (error: any) => enqueueSnackbar(error?.response?.data?.message ?? 'No se pudo terminar el servicio.', { variant: 'error' }),
      }
    );

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <DialogTitle sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Terminar servicio · {order.code}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2} sx={{ pt: 2.5 }}>
          <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
            Libera el lote para otro servicio y el tacto sigue en la bandeja. No hace falta si vas a cerrar la orden: el cierre termina el servicio.
          </Alert>
          <TextField label="Fecha de fin" type="date" fullWidth variant="filled" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ sx: { bgcolor: 'action.hover' } }} />
          {notInseminated.females.length > 0 && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {notInseminated.females.length} vientre(s) sin inseminar: no se tactan ni cuentan en la preñez.
              </Typography>
              <NotInseminatedGrid females={notInseminated.females} reasons={notInseminated.reasons} onChange={notInseminated.setReason} />
            </>
          )}
          <TextField label="Observaciones" fullWidth multiline rows={2} variant="filled" value={observations} onChange={(e) => setObservations(e.target.value)} InputProps={{ sx: { bgcolor: 'action.hover' } }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="text" onClick={onClose} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={confirm}
          disabled={mutation.isPending}
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Terminar servicio
        </Button>
      </DialogActions>
    </Dialog>
  );
}

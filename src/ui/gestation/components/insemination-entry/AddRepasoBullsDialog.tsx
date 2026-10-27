import { useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useCompany } from '@/contexts/CompanyContext';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useAddRepasoBulls } from '@/features/gestation/hooks/useInseminations';
import { StartBatchSiresStep } from '@/ui/batches/components/dialogs/start-service/StartBatchSiresStep';
import { todayIso } from '../../utils/reproductiveVerdict';

interface AddRepasoBullsDialogProps {
  order: ServiceOrder;
  onClose: () => void;
}

/**
 * "Agregar toros de repaso" (P3, IA10): the same bull picker and admission guard as "Iniciar
 * servicio". The bulls join the batch; "Retirar torada" ends the service later.
 */
export default function AddRepasoBullsDialog({ order, onClose }: AddRepasoBullsDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [] } = useCaravans(activeCompanyId, 'all');
  const mutation = useAddRepasoBulls();
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [joinedAt, setJoinedAt] = useState(todayIso());
  const males = useMemo(() => caravans.filter((c) => (c.sex === 'M' || (c.sex as string) === 'MACHO') && isBreedingCandidate(c)), [caravans]);

  const confirm = () => {
    if (selected.length === 0) {
      enqueueSnackbar('Seleccioná al menos un toro de repaso.', { variant: 'warning' });
      return;
    }
    mutation.mutate(
      { orderId: order.id, maleCaravanIds: selected, joinedAt },
      {
        onSuccess: () => {
          enqueueSnackbar(`${selected.length} toro(s) de repaso ingresaron al lote.`, { variant: 'success' });
          onClose();
        },
        onError: (error: any) => enqueueSnackbar(error?.response?.data?.message ?? 'No se pudieron agregar los toros.', { variant: 'error' }),
      }
    );
  };

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <DialogTitle sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Agregar toros de repaso · {order.code}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2} sx={{ pt: 2.5 }}>
          <TextField label="Fecha de ingreso al lote" type="date" variant="filled" value={joinedAt} onChange={(e) => setJoinedAt(e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ sx: { bgcolor: 'action.hover' } }} sx={{ maxWidth: 260 }} />
          <StartBatchSiresStep
            availableMales={males}
            selectedMaleIds={selected}
            setSelectedMaleIds={setSelected}
            femaleCount={order.female_caravan_ids.length}
            maleSearch={search}
            setMaleSearch={setSearch}
          />
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
          Agregar al lote
        </Button>
      </DialogActions>
    </Dialog>
  );
}

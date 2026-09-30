import React, { useMemo } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthOrder } from '@/features/birth-orders/types';
import { birthOrderErrorMessage, birthRowErrors } from '@/features/birth-orders/types';
import { useExecuteBirthOrder } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import BirthRollGrid from '../grid/BirthRollGrid';
import { cellErrorsByFemale, femaleFromOrderAnimal } from '../grid/birthRollTypes';
import { useBirthRollState } from '../grid/useBirthRollState';

interface ExecuteBirthOrderDialogProps {
  order: BirthOrder | null;
  onClose: () => void;
}

/**
 * "Ejecutar orden" from the screen: one round, loaded by hand instead of scanning its sheet. The
 * pending females are listed soonest due first; the ones left without an outcome stay pending for
 * the next round. It goes through the same PAR-01 processing as the paper.
 */
const ExecuteBirthOrderContent: React.FC<{ order: BirthOrder; onClose: () => void }> = ({ order, onClose }) => {
  const execute = useExecuteBirthOrder();
  const females = useMemo(
    () =>
      order.animals
        .filter((a) => a.status === 'PENDING')
        .sort((a, b) => (a.estimated_due_date ?? '9999').localeCompare(b.estimated_due_date ?? '9999'))
        .map(femaleFromOrderAnimal),
    [order.animals]
  );
  const roll = useBirthRollState(females);
  const errors = useMemo(() => cellErrorsByFemale(birthRowErrors(execute.error), females), [execute.error, females]);
  const rowErrorCount = Object.keys(errors).length;
  const generalError = execute.error && rowErrorCount === 0 ? birthOrderErrorMessage(execute.error, 'No se pudo registrar la recorrida.') : null;

  const submit = () => execute.mutate({ id: order.id, body: { animals: roll.payload() } }, { onSuccess: onClose });

  return (
    <>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Registrar recorrida ·{' '}
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              {order.code}
            </Box>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.pending_head_count} vientre(s) pendientes. Los que dejes sin resultado siguen pendientes para la próxima recorrida.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={execute.isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {rowErrorCount > 0 && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: '6px' }}>
            {rowErrorCount} vientre(s) con problemas: están marcados en la grilla. No se registró nada.
          </Alert>
        )}
        {generalError && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: '6px' }}>
            {generalError}
          </Alert>
        )}
        <BirthRollGrid females={females} state={roll} errors={errors} maxHeight="calc(100vh - 380px)" />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} disabled={execute.isPending} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={execute.isPending || roll.resolved.length === 0 || roll.problems.length > 0}
          onClick={submit}
          startIcon={execute.isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:check-circle</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Registrar {roll.resolved.length} resultado(s)
        </Button>
      </DialogActions>
    </>
  );
};

export const ExecuteBirthOrderDialog: React.FC<ExecuteBirthOrderDialogProps> = ({ order, onClose }) => (
  <Dialog open={order !== null} onClose={onClose} fullWidth maxWidth="xl" PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}>
    {order && <ExecuteBirthOrderContent key={order.id} order={order} onClose={onClose} />}
  </Dialog>
);

export default ExecuteBirthOrderDialog;

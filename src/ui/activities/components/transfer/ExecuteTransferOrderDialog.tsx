import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ExecuteTransferOrderBody } from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import type { TransferOrder } from '@/features/transfer-orders/types';
import { useTransferCategoryPlan } from '../../hooks/useTransferCategoryPlan';
import { executeOrderAnimals } from '../../hooks/executeOrderBody';
import TransferCategoryTargets from './TransferCategoryTargets';
import type { TransferableCaravan } from './transferMath';

interface ExecuteTransferOrderDialogProps {
  open: boolean;
  order: TransferOrder;
  caravans: TransferableCaravan[];
  destinationActivityCode: string | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (body: ExecuteTransferOrderBody) => void;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const HINT_BY_MODE = {
  DECLARED: 'La orden declaró la categoría nueva. Si al mover se decidió otra, cambiala acá: queda el aviso de que difiere de la orden.',
  AT_CHUTE: 'La orden dejaba la categoría para la manga. Declarala acá; la que quede en «No cambia» conserva la suya.'
} as const;

/**
 * "Ejecutar orden": the facts only whoever moved the animals knows, declared before moving them.
 *
 * When it happened — today by default, never in the future nor before the order existed — and,
 * unless the order said the category does not change, the C/S of each animal. An order whose
 * category was left for the chute can then be executed without its sheet, but never silently.
 */
export const ExecuteTransferOrderDialog: React.FC<ExecuteTransferOrderDialogProps> = ({
  open,
  order,
  caravans,
  destinationActivityCode,
  isPending,
  onClose,
  onConfirm
}) => {
  const pendingIds = useMemo(
    () => order.animals.filter((a) => a.status === 'PENDING').map((a) => a.caravan_id),
    [order.animals]
  );
  const plan = useTransferCategoryPlan(caravans, pendingIds);
  const [date, setDate] = useState(today());
  const issuedOn = order.emitted_at?.slice(0, 10) ?? null;

  useEffect(() => {
    if (!open) return;

    setDate(today());
    plan.load(order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order.id]);

  const dateError = !date
    ? 'Indicá la fecha del movimiento.'
    : date > today()
      ? 'La fecha no puede ser futura.'
      : issuedOn && date < issuedOn
        ? `La orden se emitió el ${issuedOn.split('-').reverse().join('/')}: el movimiento no puede ser anterior.`
        : null;

  const withCategory = order.category_mode !== 'KEEP';

  const confirm = () => {
    if (dateError) return;

    const animals = executeOrderAnimals(order, plan.targets, caravans);

    onConfirm({ movement_date: date, ...(animals.length > 0 ? { animals } : {}) });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={withCategory ? 'md' : 'xs'}
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Ejecutar orden {order.code}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField
            type="date"
            label="Fecha del movimiento"
            variant="filled"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={Boolean(dateError)}
            helperText={dateError ?? 'El día en que se movieron los animales. Puede ser anterior a hoy.'}
            inputProps={{ max: today(), ...(issuedOn ? { min: issuedOn } : {}) }}
            InputLabelProps={{ shrink: true }}
            sx={{ bgcolor: 'action.hover', maxWidth: 260 }}
          />

          {withCategory && (
            <Stack spacing={1.5}>
              <Alert severity="info" variant="outlined">
                {HINT_BY_MODE[order.category_mode as 'DECLARED' | 'AT_CHUTE']}
              </Alert>
              <TransferCategoryTargets
                plan={plan}
                caravans={caravans}
                selectedIds={pendingIds}
                destinationActivityCode={destinationActivityCode}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={confirm}
          disabled={isPending || Boolean(dateError)}
          variant="contained"
          sx={{ px: 4, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}
        >
          {isPending ? 'Ejecutando…' : `Mover ${pendingIds.length} animal(es)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecuteTransferOrderDialog;

import React, { useEffect, useMemo, useState } from 'react';
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
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import type { WeaningOrder, WeaningType } from '@/features/weaning-orders/types';
import { WEANING_TYPE_LABELS, WEANING_TYPES, weaningOrderErrorMessage } from '@/features/weaning-orders/types';
import { useExecuteWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrderMutations';
import ExecuteWeaningRollTable, { ExecuteRowDraft } from './ExecuteWeaningRollTable';

interface ExecuteWeaningOrderDialogProps {
  order: WeaningOrder | null;
  onClose: () => void;
}

const today = (): string => new Date().toISOString().slice(0, 10);

interface RowErrorBody {
  row_errors?: { caravana: string; errors: { message: string }[] }[];
}

/**
 * "Ejecutar orden" without the sheet: the day the calves were weaned (today by default, never
 * future) and, per pending calf, the weight and notes — plus the C/S when the order left it for the
 * chute, since somebody has to decide it. An order whose calves or new batches are still undecided
 * is executed by scanning its sheet, and this says so instead of guessing.
 */
export const ExecuteWeaningOrderDialog: React.FC<ExecuteWeaningOrderDialogProps> = ({ order, onClose }) => {
  const execute = useExecuteWeaningOrder();
  const [date, setDate] = useState(today());
  const [drafts, setDrafts] = useState<Record<number, ExecuteRowDraft>>({});
  const [weaningType, setWeaningType] = useState<WeaningType | ''>('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (order) {
      setDate(today());
      setDrafts({});
      setWeaningType('');
      execute.reset();
    }
  }, [order?.id]);

  const pending = useMemo(() => order?.animals.filter((a) => a.status === 'PENDING') ?? [], [order]);
  const labelByKey = useMemo(() => new Map(order?.destinations.map((d) => [d.key, d.label]) ?? []), [order]);
  const askCategory = order?.category_mode === 'AT_CHUTE';
  // An order that left the type for the chute is completed here: somebody saw how they were weaned.
  const askType = order != null && order.weaning_type === null;

  const blocker = !order
    ? null
    : pending.some((a) => a.destination_key === null)
      ? 'Hay crías sin lote de destete: se deciden en la manga. Ejecutá la orden escaneando su planilla DEST-01.'
      : order.destinations.some((d) => !d.stays_in_place && d.target_batch_id === null && d.resolved_batch_id === null && d.is_confined === null)
        ? 'Un lote de destete nuevo no tiene declarado si es corral o pastura. Completalo escaneando la planilla.'
        : null;

  const invalidWeight = Object.values(drafts).some((d) => {
    const weight = d.weight?.trim() ?? '';

    return weight !== '' && !(Number(weight.replace(',', '.')) > 0);
  });

  const errorsByTag = useMemo(() => {
    const body = (execute.error as { response?: { data?: RowErrorBody } } | null)?.response?.data;
    const byTag: Record<string, string[]> = {};

    (body?.row_errors ?? []).forEach((row) => {
      byTag[row.caravana.toUpperCase()] = row.errors.map((e) => e.message);
    });

    return byTag;
  }, [execute.error]);

  const confirm = () => {
    if (!order) return;

    const problem = !date || date > today()
      ? 'Indicá la fecha del destete: no puede ser futura.'
      : askType && weaningType === ''
        ? 'La orden dejó el tipo de destete para la manga: indicá cómo se destetaron.'
        : invalidWeight
          ? 'Revisá los pesos: tienen que ser mayores a cero.'
          : null;

    if (problem) {
      enqueueSnackbar(problem, { variant: 'warning' });
      return;
    }

    execute.mutate(
      {
        id: order.id,
        body: {
          weaning_date: date,
          ...(askType && weaningType !== '' ? { weaning_type: weaningType } : {}),
          // Every pending calf is sent: in an order decided at the chute, a calf sent without a
          // category is the decision "no change".
          animals: pending.map((animal) => {
            const draft = drafts[animal.caravan_id] ?? {};
            const weight = draft.weight?.trim().replace(',', '.') ?? '';

            return {
              caravan_id: animal.caravan_id,
              weight: weight !== '' ? Number(weight) : null,
              observations: draft.observations?.trim() || null,
              category_id: draft.category?.categoryId ?? null,
              subcategory_id: draft.category?.subcategoryId ?? null
            };
          })
        }
      },
      { onSuccess: onClose }
    );
  };

  const generalError = execute.error && Object.keys(errorsByTag).length === 0
    ? weaningOrderErrorMessage(execute.error, 'No se pudo ejecutar la orden')
    : null;

  return (
    <Dialog
      open={order !== null}
      onClose={execute.isPending ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Ejecutar orden ·{' '}
          <Box component="span" sx={{ fontFamily: 'monospace' }}>
            {order?.code}
          </Box>
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={execute.isPending}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Fecha del destete"
            type="date"
            variant="filled"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            inputProps={{ max: today() }}
            helperText="El día en que se desmadraron las crías. No puede ser futura ni anterior a la emisión."
            InputLabelProps={{ shrink: true }}
            InputProps={{ disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
            sx={{ flex: 1 }}
          />
          {askType && !blocker && (
            <TextField
              select
              label="Tipo de destete"
              variant="filled"
              value={weaningType}
              onChange={(e) => setWeaningType(e.target.value as WeaningType | '')}
              helperText="La orden lo dejó para la manga: cómo se destetaron."
              InputProps={{ disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
              sx={{ flex: 1 }}
            >
              {WEANING_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {WEANING_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        {blocker ? (
          <Alert severity="warning" sx={{ borderRadius: '6px' }}>
            {blocker}
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {pending.length} cría(s) pendientes. El peso es opcional: sin peso, la cría conserva el último registrado.
              {askCategory && ' La orden deja la categoría para la manga: elegí la C/S nueva o dejá "No cambia".'}
            </Typography>
            <Box sx={{ maxHeight: 420, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
              <ExecuteWeaningRollTable
                animals={pending}
                labelByKey={labelByKey}
                drafts={drafts}
                onChange={(caravanId, patch) => setDrafts((prev) => ({ ...prev, [caravanId]: { ...prev[caravanId], ...patch } }))}
                askCategory={askCategory}
                errorsByTag={errorsByTag}
              />
            </Box>
          </>
        )}

        {generalError && (
          <Alert severity="error" sx={{ borderRadius: '6px' }}>
            {generalError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} disabled={execute.isPending} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Volver
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={Boolean(blocker) || execute.isPending}
          onClick={confirm}
          startIcon={execute.isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Destetar {pending.length} cría(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecuteWeaningOrderDialog;

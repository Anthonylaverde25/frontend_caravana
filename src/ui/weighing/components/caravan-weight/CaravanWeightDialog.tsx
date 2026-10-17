import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { weighingWarnings } from '@/core/weighing/domain/services/weighingSanity';
import { useCaravanWeights } from '@/features/caravans/hooks/useCaravanWeights';
import { useRecordCaravanWeight } from '@/features/caravans/hooks/useRecordCaravanWeight';
import { useWeighingTypes } from '@/features/weighing/hooks/useWeighingTypes';
import { CaravanWeightForm } from './CaravanWeightForm';
import { CaravanWeightHistoryTable } from './CaravanWeightHistoryTable';
import {
  CaravanWeightFormErrors,
  CaravanWeightFormState,
  initialFormState,
  previousWeightBefore,
  toPayload,
  validateForm,
} from './caravanWeightFormModel';

interface CaravanWeightDialogProps {
  open: boolean;
  onClose: () => void;
  caravan: Caravan | null;
}

/** Records a single weighing of one animal and shows its history. */
export function CaravanWeightDialog({ open, onClose, caravan }: CaravanWeightDialogProps) {
  const { data: weights = [], isLoading } = useCaravanWeights(caravan?.id);
  const { data: allTypes = [] } = useWeighingTypes();
  // A batch purpose (cage re-weighing) is weighed from the batch, never on one caravan.
  const types = useMemo(() => allTypes.filter((t) => t.allows_individual), [allTypes]);
  const { mutateAsync: recordWeight, isPending } = useRecordCaravanWeight();

  const defaultType = types.find((t) => t.code === 'CONTROL') ?? types[0];
  const [form, setForm] = useState<CaravanWeightFormState>(() => initialFormState());
  const [errors, setErrors] = useState<CaravanWeightFormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(initialFormState(defaultType));
      setErrors({});
    }
  }, [open, caravan?.id, defaultType?.code]);

  const warnings = useMemo(
    () => weighingWarnings(Number(form.weight), form.date, form.type, previousWeightBefore(weights, form.date)),
    [form.weight, form.date, form.type, weights]
  );

  if (!caravan) return null;

  // The row that opened the dialog is a snapshot; the history is refreshed after each save.
  const currentWeight = weights.find((w) => w.current)?.weight ?? caravan.current_weight;

  const change = (patch: Partial<CaravanWeightFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof CaravanWeightFormErrors)[]).forEach((key) => delete next[key]);
      return next;
    });
  };

  const submit = async () => {
    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    await recordWeight({ id: caravan.id, data: toPayload(form) });
    setForm(initialFormState(types.find((t) => t.code === form.type)));
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box
        sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Pesajes
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Caravana {caravan.identification}
            {currentWeight ? ` · peso vigente ${currentWeight.toLocaleString('es-AR')} kg` : ' · sin peso registrado'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <CaravanWeightForm form={form} errors={errors} types={types} warnings={warnings} onChange={change} />
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Historial
        </Typography>
        <CaravanWeightHistoryTable weights={weights} isLoading={isLoading} />
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}
      >
        <Button onClick={onClose} disabled={isPending} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cerrar
        </Button>
        <Button
          onClick={submit}
          disabled={isPending}
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 3.5,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {isPending ? 'Guardando...' : 'Guardar pesaje'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

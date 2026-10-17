import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { BatchWeighingEntry } from '@/core/weighing/domain/entities/Weighing';
import { summarizeCageGroups, summarizeDeclaredAverage } from '@/core/weighing/domain/services/cageGroups';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import { useRegisterBatchWeighing } from '@/features/weighing/hooks/useRegisterBatchWeighing';
import { useWeighingTypes } from '@/features/weighing/hooks/useWeighingTypes';
import { AverageEntryFields } from './AverageEntryFields';
import { BatchWeighingDialogHeader } from './BatchWeighingDialogHeader';
import { BatchWeighingExtras } from './BatchWeighingExtras';
import { BatchWeighingHeaderFields } from './BatchWeighingHeaderFields';
import { BatchWeighingSummary } from './BatchWeighingSummary';
import { CageGroupsSheet } from './CageGroupsSheet';
import {
  BatchWeighingFormErrors,
  BatchWeighingFormState,
  hasErrors,
  initialBatchWeighingState,
  toBatchWeighingPayload,
  toGroupInput,
  validateBatchWeighing,
} from './batchWeighingFormModel';

interface BatchWeighingDialogProps {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
}

/**
 * Weighs a batch as a whole on a cage or truck scale. What is measured is the batch; each animal
 * receives the average as a consequence, which is why this lives on the batch and not on a caravan.
 */
export function BatchWeighingDialog({ open, onClose, batch }: BatchWeighingDialogProps) {
  const { data: allTypes = [] } = useWeighingTypes();
  const types = useMemo(() => allTypes.filter((t) => t.allows_group), [allTypes]);
  const defaultType = types.find((t) => t.code === 'BATCH_CONTROL') ?? types[0];

  // The heads in possession now: the set the average is assigned to.
  const { data: headsPage } = useCaravansSummary({ batchId: batch?.id, perPage: 1, enabled: open && !!batch });
  const batchHeads = headsPage ? headsPage.meta.total : null;

  const register = useRegisterBatchWeighing();
  const [form, setForm] = useState<BatchWeighingFormState>(() => initialBatchWeighingState());
  const [errors, setErrors] = useState<BatchWeighingFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialBatchWeighingState(defaultType));
      setErrors({});
      setServerError(null);
    }
  }, [open, batch?.id, defaultType?.code]);

  // The heads of the batch are the usual answer: prefilled, still editable.
  useEffect(() => {
    if (open && batchHeads !== null) {
      setForm((prev) => (prev.headCount === '' ? { ...prev, headCount: String(batchHeads) } : prev));
    }
  }, [open, batchHeads, form.entry]);

  const summary = useMemo(
    () =>
      form.entry === 'AVERAGE'
        ? summarizeDeclaredAverage(Number(form.averageWeight), Number(form.headCount), batchHeads ?? 0)
        : summarizeCageGroups(form.groups.map(toGroupInput), batchHeads ?? 0),
    [form.entry, form.averageWeight, form.headCount, form.groups, batchHeads]
  );

  if (!batch) return null;

  const change = (patch: Partial<BatchWeighingFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setServerError(null);
  };

  // Turning the tare off drops what was typed: an undeclared tare is zero, never a hidden value.
  const toggleTare = (withTare: boolean) =>
    change({ withTare, groups: withTare ? form.groups : form.groups.map((g) => ({ ...g, tare: '0' })) });

  const submit = async () => {
    const found = validateBatchWeighing(form);
    setErrors(found);
    if (hasErrors(found)) return;

    try {
      await register.mutateAsync(toBatchWeighingPayload(batch.id, form));
      onClose();
    } catch (error: any) {
      const data = error?.response?.data;
      const firstFieldError = data?.errors ? (Object.values(data.errors)[0] as string[])[0] : null;
      setServerError(firstFieldError ?? data?.message ?? 'No se pudo registrar el pesaje.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={register.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <BatchWeighingDialogHeader batch={batch} batchHeads={batchHeads} disabled={register.isPending} onClose={onClose} />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <BatchWeighingHeaderFields form={form} errors={errors} types={types} onChange={change} />

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={form.entry}
                onChange={(_, entry: BatchWeighingEntry | null) => entry && change({ entry })}
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 2, py: 0.5 } }}
              >
                <ToggleButton value="AVERAGE">Promedio del lote</ToggleButton>
                <ToggleButton value="LOADS">Por jaulas</ToggleButton>
              </ToggleButtonGroup>
              {form.entry === 'LOADS' && (
                <Tooltip title="Para un camión pesado cargado y vacío, o una balanza que no se puso en cero">
                  <FormControlLabel
                    control={<Checkbox size="small" checked={form.withTare} onChange={(e) => toggleTare(e.target.checked)} />}
                    label={<Typography variant="caption">Descontar tara</Typography>}
                    sx={{ mr: 0 }}
                  />
                </Tooltip>
              )}
            </Stack>

            {form.entry === 'AVERAGE' ? (
              <AverageEntryFields form={form} errors={errors} batchHeads={batchHeads} onChange={change} />
            ) : (
              <CageGroupsSheet
                groups={form.groups}
                rowErrors={errors.rows}
                withTare={form.withTare}
                summary={summary}
                onChange={(groups) => change({ groups })}
              />
            )}
          </Box>

          <BatchWeighingSummary summary={summary} batchHeads={batchHeads} entry={form.entry} />
          <BatchWeighingExtras observations={form.observations} onObservationsChange={(observations) => change({ observations })} />
          {serverError && (
            <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
              {serverError}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={register.isPending} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={submit}
          disabled={register.isPending}
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
          {register.isPending ? 'Registrando...' : 'Registrar pesaje'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

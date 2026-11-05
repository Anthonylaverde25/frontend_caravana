import { forwardRef, ReactElement, Ref, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Checkbox, Dialog, FormControlLabel, Paper, Slide, Stack, Tooltip, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { summarizeCageGroups } from '@/core/weighing/domain/services/cageGroups';
import { useBatchOverview } from '@/features/batches/hooks/useBatchOverview';
import { useRegisterBatchWeighing } from '@/features/weighing/hooks/useRegisterBatchWeighing';
import { useWeighingTypes } from '@/features/weighing/hooks/useWeighingTypes';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { BatchWeighingContextCard } from './BatchWeighingContextCard';
import { BatchWeighingHeaderFields } from './BatchWeighingHeaderFields';
import { BatchWeighingSummary } from './BatchWeighingSummary';
import { CageGroupsSheet } from './CageGroupsSheet';
import { CategoryAveragesSheet } from './CategoryAveragesSheet';
import {
  BatchWeighingFormErrors,
  BatchWeighingFormState,
  hasErrors,
  initialBatchWeighingState,
  loadsByCategory,
  toBatchWeighingPayload,
  toGroupInput,
  validateBatchWeighing,
} from './batchWeighingFormModel';

interface BatchWeighingDialogProps {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
}

const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Weighs a batch, from the average of each category or from its cages. What is measured is the
 * batch; each animal receives the average of its category as a consequence, which is why this lives
 * on the batch and not on a caravan.
 */
export function BatchWeighingDialog({ open, onClose, batch }: BatchWeighingDialogProps) {
  const { data: allTypes = [] } = useWeighingTypes();
  const types = useMemo(() => allTypes.filter((t) => t.allows_group), [allTypes]);
  const defaultType = types.find((t) => t.code === 'BATCH_AVERAGE') ?? types[0];

  // Who is in possession now: the rows of the sheet and the set the averages are assigned to.
  const { data: overview, isLoading, isError } = useBatchOverview(open ? batch?.id : undefined);
  const categories = useMemo(() => overview?.category_composition ?? [], [overview]);
  const batchHeads = overview ? categories.reduce((sum, c) => sum + c.count, 0) : null;

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

  const entry = types.find((t) => t.code === form.type)?.batch_entry ?? 'BY_CATEGORY';

  const summary = useMemo(
    () => summarizeCageGroups(form.groups.map((row) => toGroupInput(row, categories)), batchHeads ?? 0),
    [form.groups, categories, batchHeads]
  );

  if (!batch) return null;

  const change = (patch: Partial<BatchWeighingFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setServerError(null);
    // What was marked belongs to the sheet of the previous type.
    if (patch.type && patch.type !== form.type) setErrors({});
  };

  // Turning the tare off drops what was typed: an undeclared tare is zero, never a hidden value.
  const toggleTare = (withTare: boolean) =>
    change({ withTare, groups: withTare ? form.groups : form.groups.map((g) => ({ ...g, tare: '0' })) });

  const submit = async () => {
    const found = validateBatchWeighing(form, entry, categories);
    setErrors(found);
    if (hasErrors(found)) return;

    try {
      await register.mutateAsync(toBatchWeighingPayload(batch.id, form, entry, categories));
      onClose();
    } catch (error: any) {
      const data = error?.response?.data;
      const firstFieldError = data?.errors ? (Object.values(data.errors)[0] as string[])[0] : null;
      setServerError(firstFieldError ?? data?.message ?? 'No se pudo registrar el pesaje.');
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={register.isPending ? undefined : onClose}
      TransitionComponent={SlideUp}
      PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}
    >
      <FullScreenEntryBar
        title={`Pesar lote · ${batch.name}`}
        subtitle={entry === 'BY_CATEGORY' ? 'El nuevo promedio de cada categoría, sin caravana por caravana.' : 'Las jaulas o el camión pesados: cada categoría recibe su propio promedio.'}
        primaryLabel={register.isPending ? 'Registrando...' : 'Registrar pesaje'}
        primaryIcon="heroicons-outline:check"
        busy={register.isPending}
        onClose={onClose}
        onPrimary={submit}
      />

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 3 }, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <BatchWeighingContextCard batch={batch} categories={categories} entry={entry} />
          <BatchWeighingHeaderFields form={form} errors={errors} types={types} onChange={change} />
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, minHeight: 28 }}>
            <Typography sx={sectionTitleSx}>{entry === 'BY_CATEGORY' ? '3. Promedio por categoría' : '3. Jaulas'}</Typography>
            {entry === 'LOADS' && (
              <Tooltip title="Para un camión pesado cargado y vacío, o una balanza que no se puso en cero">
                <FormControlLabel
                  control={<Checkbox size="small" checked={form.withTare} onChange={(e) => toggleTare(e.target.checked)} />}
                  label={<Typography variant="caption">Descontar tara</Typography>}
                  sx={{ mr: 0 }}
                />
              </Tooltip>
            )}
          </Stack>

          <Stack spacing={1.5}>
            {entry === 'BY_CATEGORY' ? (
              <CategoryAveragesSheet
                categories={categories}
                loading={isLoading}
                averages={form.averages}
                rowErrors={errors.averageRows}
                type={form.type}
                date={form.date}
                onChange={(key, value) => {
                  change({ averages: { ...form.averages, [key]: value } });
                  setErrors(({ averages: _answered, ...rest }) => rest);
                }}
              />
            ) : (
              <>
                <CageGroupsSheet groups={form.groups} categories={categories} rowErrors={errors.rows} withTare={form.withTare} summary={summary} onChange={(groups) => change({ groups })} />
                <BatchWeighingSummary loads={loadsByCategory(form, categories)} />
              </>
            )}
            {isError && (
              <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                No se pudo cargar la composición del lote.
              </Alert>
            )}
            {errors.averages && (
              <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                {errors.averages}
              </Alert>
            )}
            {serverError && (
              <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                {serverError}
              </Alert>
            )}
          </Stack>
        </Paper>
      </Box>
    </Dialog>
  );
}

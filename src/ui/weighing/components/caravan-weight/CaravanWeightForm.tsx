import { Alert, Grid, MenuItem, Stack, TextField } from '@mui/material';
import {
  INDIVIDUAL_WEIGHING_METHODS,
  SHRUNK_CONDITION_LABELS,
  ShrunkCondition,
  WEIGHING_METHOD_LABELS,
  WeighingMethod,
  WeighingType,
} from '@/core/weighing/domain/entities/Weighing';
import { filledSx } from '@/ui/batches/components/external/externalFormParts';
import { CaravanWeightFormErrors, CaravanWeightFormState } from './caravanWeightFormModel';

interface CaravanWeightFormProps {
  form: CaravanWeightFormState;
  errors: CaravanWeightFormErrors;
  types: WeighingType[];
  warnings: string[];
  onChange: (patch: Partial<CaravanWeightFormState>) => void;
}

/** The fields of one weighing: purpose, kilos, day and the basis they were taken on. */
export function CaravanWeightForm({ form, errors, types, warnings, onChange }: CaravanWeightFormProps) {
  const selectedType = types.find((t) => t.code === form.type);

  const changeType = (code: string) => {
    const type = types.find((t) => t.code === code);
    const method = type?.default_method;
    onChange({
      type: type?.code ?? form.type,
      // An arrival is usually averaged per truck; one animal on its own is an individual reading.
      method: method && INDIVIDUAL_WEIGHING_METHODS.includes(method) ? method : 'INDIVIDUAL',
      shrunkCondition: type?.default_shrunk_condition ?? form.shrunkCondition,
      shrinkPct: '',
    });
  };

  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Tipo de pesaje"
        value={form.type}
        onChange={(e) => changeType(e.target.value)}
        variant="filled"
        fullWidth
        helperText={selectedType?.description ?? undefined}
        sx={filledSx}
      >
        {types.map((t) => (
          <MenuItem key={t.code} value={t.code}>
            {t.name}
          </MenuItem>
        ))}
      </TextField>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Peso (kg)"
            type="number"
            value={form.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            variant="filled"
            fullWidth
            required
            inputProps={{ min: 0, step: 0.5 }}
            error={!!errors.weight}
            helperText={errors.weight}
            sx={filledSx}
          />
        </Grid>
        <Grid size={{ xs: 7, sm: 5 }}>
          <TextField
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => onChange({ date: e.target.value })}
            variant="filled"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
            sx={filledSx}
          />
        </Grid>
        <Grid size={{ xs: 5, sm: 3 }}>
          <TextField
            label="Hora"
            type="time"
            value={form.time}
            onChange={(e) => onChange({ time: e.target.value })}
            variant="filled"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={filledSx}
          />
        </Grid>
      </Grid>

      {warnings.map((warning) => (
        <Alert key={warning} severity="warning" sx={{ fontSize: '0.8rem', py: 0.5 }}>
          {warning}
        </Alert>
      ))}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Método"
            value={form.method}
            onChange={(e) => onChange({ method: e.target.value as WeighingMethod })}
            variant="filled"
            fullWidth
            sx={filledSx}
          >
            {INDIVIDUAL_WEIGHING_METHODS.map((m) => (
              <MenuItem key={m} value={m}>
                {WEIGHING_METHOD_LABELS[m]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: form.shrunkCondition === 'CALCULATED' ? 7 : 12, sm: form.shrunkCondition === 'CALCULATED' ? 4 : 6 }}>
          <TextField
            select
            label="Desbaste"
            value={form.shrunkCondition}
            onChange={(e) => onChange({ shrunkCondition: e.target.value as ShrunkCondition, shrinkPct: '' })}
            variant="filled"
            fullWidth
            sx={filledSx}
          >
            {(Object.keys(SHRUNK_CONDITION_LABELS) as ShrunkCondition[]).map((c) => (
              <MenuItem key={c} value={c}>
                {SHRUNK_CONDITION_LABELS[c]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {form.shrunkCondition === 'CALCULATED' && (
          <Grid size={{ xs: 5, sm: 2 }}>
            <TextField
              label="%"
              type="number"
              value={form.shrinkPct}
              onChange={(e) => onChange({ shrinkPct: e.target.value })}
              variant="filled"
              fullWidth
              required
              inputProps={{ min: 0, max: 30, step: 0.5 }}
              error={!!errors.shrinkPct}
              helperText={errors.shrinkPct}
              sx={filledSx}
            />
          </Grid>
        )}
      </Grid>

      <TextField
        label="Observaciones"
        value={form.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        variant="filled"
        fullWidth
        sx={filledSx}
      />
    </Stack>
  );
}

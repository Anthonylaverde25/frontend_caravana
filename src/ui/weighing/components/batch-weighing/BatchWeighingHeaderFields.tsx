import { InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { SHRUNK_CONDITION_LABELS, ShrunkCondition, WeighingType } from '@/core/weighing/domain/entities/Weighing';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { BatchWeighingFormErrors, BatchWeighingFormState } from './batchWeighingFormModel';

interface BatchWeighingHeaderFieldsProps {
  form: BatchWeighingFormState;
  errors: BatchWeighingFormErrors;
  types: WeighingType[];
  onChange: (patch: Partial<BatchWeighingFormState>) => void;
}

const fieldSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover' } } as const;

/** "2. Pesaje": why, when and on which gut-fill basis the batch was weighed. */
export function BatchWeighingHeaderFields({ form, errors, types, onChange }: BatchWeighingHeaderFieldsProps) {
  const selected = types.find((t) => t.code === form.type);
  const calculated = form.shrunkCondition === 'CALCULATED';

  const changeType = (code: string) => {
    const type = types.find((t) => t.code === code);
    onChange({
      type: type?.code ?? form.type,
      shrunkCondition: type?.default_shrunk_condition ?? form.shrunkCondition,
      shrinkPct: '',
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>2. Pesaje</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <TextField select fullWidth size="small" label="Tipo de pesaje" value={form.type} onChange={(e) => changeType(e.target.value)} variant="filled" sx={fieldSx}>
          {types.map((t) => (
            <MenuItem key={t.code} value={t.code}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>
        {selected?.description && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {selected.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <TextField
            size="small"
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => onChange({ date: e.target.value })}
            variant="filled"
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
            sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
          />
          <TextField
            size="small"
            label="Hora"
            type="time"
            value={form.time}
            onChange={(e) => onChange({ time: e.target.value })}
            variant="filled"
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, width: 110, flexShrink: 0 }}
          />
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <TextField
            select
            size="small"
            label="Desbaste"
            value={form.shrunkCondition}
            onChange={(e) => onChange({ shrunkCondition: e.target.value as ShrunkCondition, shrinkPct: '' })}
            variant="filled"
            sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
          >
            {(Object.keys(SHRUNK_CONDITION_LABELS) as ShrunkCondition[]).map((c) => (
              <MenuItem key={c} value={c}>
                {SHRUNK_CONDITION_LABELS[c]}
              </MenuItem>
            ))}
          </TextField>
          {calculated && (
            <TextField
              size="small"
              label="Desbaste"
              type="number"
              value={form.shrinkPct}
              onChange={(e) => onChange({ shrinkPct: e.target.value })}
              variant="filled"
              required
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ min: 0, max: 30, step: 0.5 }}
              error={!!errors.shrinkPct}
              helperText={errors.shrinkPct}
              sx={{ ...fieldSx, width: 110, flexShrink: 0 }}
            />
          )}
        </Stack>

        <TextField
          fullWidth
          size="small"
          label="Responsable"
          value={form.responsable}
          onChange={(e) => onChange({ responsable: e.target.value })}
          variant="filled"
          sx={fieldSx}
        />
        <TextField
          fullWidth
          size="small"
          label="Observaciones"
          value={form.observations}
          onChange={(e) => onChange({ observations: e.target.value })}
          variant="filled"
          multiline
          minRows={2}
          placeholder="Ej.: se pesó después de la lluvia, piso de la jaula con barro."
          sx={fieldSx}
        />
      </Stack>
    </Paper>
  );
}

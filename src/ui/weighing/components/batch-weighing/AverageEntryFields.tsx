import { InputAdornment, Stack, TextField } from '@mui/material';
import { BatchWeighingFormErrors, BatchWeighingFormState } from './batchWeighingFormModel';

interface AverageEntryFieldsProps {
  form: BatchWeighingFormState;
  errors: BatchWeighingFormErrors;
  batchHeads: number | null;
  onChange: (patch: Partial<BatchWeighingFormState>) => void;
}

const compactSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover' } } as const;

/** The average the operator already has, and the heads it covers (the batch's, unless told otherwise). */
export function AverageEntryFields({ form, errors, batchHeads, onChange }: AverageEntryFieldsProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
      <TextField
        autoFocus
        size="small"
        label="Peso promedio"
        value={form.averageWeight}
        onChange={(e) => onChange({ averageWeight: e.target.value.replace(/[^\d.,]/g, '').replace(',', '.') })}
        variant="filled"
        required
        error={!!errors.averageWeight}
        helperText={errors.averageWeight}
        InputProps={{ endAdornment: <InputAdornment position="end">kg/cab</InputAdornment> }}
        inputProps={{ inputMode: 'decimal', style: { textAlign: 'right', fontWeight: 700 } }}
        sx={{ ...compactSx, flex: 1, minWidth: 0, width: '100%' }}
      />
      <TextField
        size="small"
        label="Cabezas pesadas"
        value={form.headCount}
        onChange={(e) => onChange({ headCount: e.target.value.replace(/\D/g, '') })}
        variant="filled"
        required
        error={!!errors.headCount}
        helperText={errors.headCount || (batchHeads !== null ? `Total en lote: ${batchHeads} cab.` : undefined)}
        inputProps={{ inputMode: 'numeric', style: { textAlign: 'right' } }}
        sx={{ ...compactSx, flex: 1, minWidth: 0, width: '100%' }}
      />
    </Stack>
  );
}

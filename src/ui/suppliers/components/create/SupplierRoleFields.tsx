import { Checkbox, FormControlLabel, FormHelperText, Stack, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { SupplierFormValues } from '../SupplierSchema';

interface SupplierRoleFieldsProps {
  control: Control<SupplierFormValues>;
  errors: FieldErrors<SupplierFormValues>;
}

/**
 * What the provider sells. Declared, not inferred: a livestock seller just registered has no
 * farms yet. At least one is required (checked when the main button is clicked).
 */
export default function SupplierRoleFields({ control, errors }: SupplierRoleFieldsProps) {
  const error = errors.roles?.message ?? errors.roles?.root?.message;

  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}>
        Qué vende
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 3 }}>
        <Controller
          name="roles.supplies_livestock"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              label="Vende hacienda"
            />
          )}
        />
        <Controller
          name="roles.supplies_items"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              label="Vende artículos o servicios"
            />
          )}
        />
      </Stack>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Stack>
  );
}

import React from 'react';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import { TROOP_CONDITION_LABELS } from '@/features/entry-orders/types';
import { ExternalBatchForm, ExternalFormSection, filledSx } from './externalFormParts';
import ExternalCategoriesEditor from './ExternalCategoriesEditor';
import ExternalSexCompositionField from './ExternalSexCompositionField';

/**
 * What was bought: one or more categories with their head, of which sexes, of what age and in what
 * state. The head of the troop is the sum of its categories. The sexes are declared here, once for
 * the whole troop, narrowed by the categories chosen.
 */
export const ExternalTroopSection: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { watch, setValue, register, formState } = form;
  const { errors } = formState;

  return (
    <ExternalFormSection title="Tropa">
      <ExternalCategoriesEditor form={form} />
      <ExternalSexCompositionField form={form} />

      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          {...register('age_min_months')}
          label="Edad desde"
          type="number"
          variant="filled"
          inputProps={{ min: 0 }}
          error={!!errors.age_min_months}
          sx={{ ...filledSx, flex: 1 }}
        />
        <Typography sx={{ pt: 0.5, fontWeight: 700, color: 'text.secondary' }}>/</Typography>
        <TextField
          {...register('age_max_months')}
          label="hasta (meses)"
          type="number"
          variant="filled"
          inputProps={{ min: 0 }}
          error={!!errors.age_max_months}
          helperText={errors.age_max_months?.message ?? 'Rango aproximado, ej: 9/10.'}
          sx={{ ...filledSx, flex: 1 }}
        />
      </Stack>
      <TextField
        select
        fullWidth
        label="Estado"
        variant="filled"
        required
        value={watch('condition') ?? ''}
        onChange={(e) =>
          setValue('condition', e.target.value as never, {
            shouldValidate: true
          })
        }
        error={!!errors.condition}
        helperText={errors.condition?.message}
        sx={filledSx}
      >
        {Object.entries(TROOP_CONDITION_LABELS).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </ExternalFormSection>
  );
};

export default ExternalTroopSection;

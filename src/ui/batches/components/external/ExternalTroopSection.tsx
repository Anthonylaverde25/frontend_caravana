import React from 'react';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { TROOP_CONDITION_LABELS } from '@/features/entry-orders/types';
import { ExternalBatchForm, ExternalFormSection, OptionalGroup, clearFields, filledSx, hasValue } from './externalFormParts';
import ExternalCategoriesEditor from './ExternalCategoriesEditor';
import ExternalSexCompositionField from './ExternalSexCompositionField';

/**
 * What was bought: one or more categories with their head, of which sexes, of what age and in what
 * state. The head of the troop is the sum of its categories. The sexes are declared here, once for
 * the whole troop, narrowed by the categories chosen. The age range is optional and stays hidden
 * until asked for.
 */
export const ExternalTroopSection: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { watch, setValue, register, formState } = form;
  const { errors } = formState;
  const ageFilled =
    hasValue(watch('age_min_months'), watch('age_max_months')) || !!errors.age_min_months || !!errors.age_max_months;

  return (
    <ExternalFormSection title="Tropa">
      <ExternalCategoriesEditor form={form} />

      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <ExternalSexCompositionField form={form} />
        </Box>

        <TextField
          select
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
          sx={{ ...filledSx, flex: 1 }}
        >
          {Object.entries(TROOP_CONDITION_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <OptionalGroup
        addLabel="+ Rango de edad"
        filled={ageFilled}
        onClear={() => clearFields(form, ['age_min_months', 'age_max_months'])}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            {...register('age_min_months')}
            label="Edad desde"
            type="number"
            variant="filled"
            inputProps={{ min: 0 }}
            error={!!errors.age_min_months}
            sx={{ ...filledSx, flex: 1 }}
          />
          <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>/</Typography>
          <TextField
            {...register('age_max_months')}
            label="hasta (meses)"
            type="number"
            variant="filled"
            inputProps={{ min: 0 }}
            error={!!errors.age_max_months}
            helperText={errors.age_max_months?.message ?? 'Ej: 9/10'}
            sx={{ ...filledSx, flex: 1 }}
          />
        </Stack>
      </OptionalGroup>
    </ExternalFormSection>
  );
};

export default ExternalTroopSection;

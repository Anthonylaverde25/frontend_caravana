import React from 'react';
import { InputAdornment, Stack, TextField } from '@mui/material';
import { ExternalBatchForm, ExternalFormSection, YesNoField, filledSx, kgAdornment } from './externalFormParts';

/**
 * Weights and health of the troop as purchased: approximate, minimum and maximum weight, the
 * shrink (desbaste) applied, whether it knows how to eat from a feeder and whether it is
 * vaccinated against ticks. The two yes/no facts start unanswered and must be answered.
 */
export const ExternalWeightsHealthSection: React.FC<{
  form: ExternalBatchForm;
}> = ({ form }) => {
  const { register, watch, setValue, formState } = form;
  const { errors } = formState;

  return (
    <ExternalFormSection title="Peso y sanidad">
      <TextField
        {...register('estimated_weight')}
        fullWidth
        label="Peso aproximado"
        type="number"
        variant="filled"
        required
        error={!!errors.estimated_weight}
        helperText={errors.estimated_weight?.message ?? 'Promedio por cabeza.'}
        InputProps={{ endAdornment: kgAdornment }}
        sx={filledSx}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('min_weight')}
          label="Peso mínimo (opcional)"
          type="number"
          variant="filled"
          error={!!errors.min_weight}
          helperText={errors.min_weight?.message}
          InputProps={{ endAdornment: kgAdornment }}
          sx={{ ...filledSx, flex: 1 }}
        />
        <TextField
          {...register('max_weight')}
          label="Peso máximo (opcional)"
          type="number"
          variant="filled"
          error={!!errors.max_weight}
          helperText={errors.max_weight?.message}
          InputProps={{ endAdornment: kgAdornment }}
          sx={{ ...filledSx, flex: 1 }}
        />
      </Stack>
      <TextField
        {...register('shrink_percent')}
        fullWidth
        label="Desbaste (opcional)"
        type="number"
        variant="filled"
        inputProps={{ min: 0, max: 99.99, step: 0.1 }}
        error={!!errors.shrink_percent}
        helperText={errors.shrink_percent?.message}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>
        }}
        sx={filledSx}
      />

      <Stack direction="row" spacing={4}>
        <YesNoField
          label="Sabe comer"
          hint="¿Come de comedero?"
          value={watch('knows_to_eat')}
          onChange={(value) => setValue('knows_to_eat', value, { shouldValidate: true })}
          error={errors.knows_to_eat?.message}
        />
        <YesNoField
          label="Garrapata"
          hint="Sí = vacunada contra la garrapata"
          value={watch('tick_vaccinated')}
          onChange={(value) => setValue('tick_vaccinated', value, { shouldValidate: true })}
          error={errors.tick_vaccinated?.message}
        />
      </Stack>
    </ExternalFormSection>
  );
};

export default ExternalWeightsHealthSection;

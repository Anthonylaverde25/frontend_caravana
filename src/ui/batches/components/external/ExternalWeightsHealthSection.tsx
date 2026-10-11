import React from 'react';
import { InputAdornment, Stack, TextField } from '@mui/material';
import {
  ExternalBatchForm,
  ExternalFormSection,
  OptionalGroup,
  YesNoField,
  clearFields,
  filledSx,
  hasValue,
  kgAdornment
} from './externalFormParts';

/**
 * Weights and health of the troop as purchased: approximate weight (required), and the optional
 * weight range and shrink (desbaste), which stay hidden until asked for. Whether it knows how to eat
 * from a feeder and whether it is vaccinated against ticks start unanswered and must be answered.
 */
export const ExternalWeightsHealthSection: React.FC<{
  form: ExternalBatchForm;
}> = ({ form }) => {
  const { register, watch, setValue, formState } = form;
  const { errors } = formState;
  const weightRangeFilled =
    hasValue(watch('min_weight'), watch('max_weight')) || !!errors.min_weight || !!errors.max_weight;
  const shrinkFilled = hasValue(watch('shrink_percent')) || !!errors.shrink_percent;

  return (
    <ExternalFormSection title="Peso y sanidad">
      <TextField
        {...register('estimated_weight')}
        label="Peso aproximado"
        type="number"
        variant="filled"
        required
        error={!!errors.estimated_weight}
        helperText={errors.estimated_weight?.message ?? 'Promedio por cabeza'}
        InputProps={{ endAdornment: kgAdornment }}
        sx={filledSx}
      />

      <OptionalGroup
        addLabel="+ Rango de peso"
        filled={weightRangeFilled}
        onClear={() => clearFields(form, ['min_weight', 'max_weight'])}
      >
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
      </OptionalGroup>

      <OptionalGroup
        addLabel="+ Desbaste"
        filled={shrinkFilled}
        onClear={() => clearFields(form, ['shrink_percent'])}
      >
        <TextField
          {...register('shrink_percent')}
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
      </OptionalGroup>

      <Stack direction="row" spacing={2}>
        <YesNoField
          label="Sabe comer"
          hint="¿Come de comedero?"
          value={watch('knows_to_eat')}
          onChange={(value) => setValue('knows_to_eat', value, { shouldValidate: true })}
          error={errors.knows_to_eat?.message}
          sx={{ flex: 1 }}
        />
        <YesNoField
          label="Garrapata"
          hint="Sí = vacunada contra la garrapata"
          value={watch('tick_vaccinated')}
          onChange={(value) => setValue('tick_vaccinated', value, { shouldValidate: true })}
          error={errors.tick_vaccinated?.message}
          sx={{ flex: 1 }}
        />
      </Stack>
    </ExternalFormSection>
  );
};

export default ExternalWeightsHealthSection;

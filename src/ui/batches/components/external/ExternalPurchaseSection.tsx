import React from 'react';
import { Stack, TextField } from '@mui/material';
import { ExternalBatchForm, ExternalFormSection, OptionalGroup, clearFields, filledSx, hasValue } from './externalFormParts';

interface ExternalPurchaseSectionProps {
  form: ExternalBatchForm;
}

/**
 * Purchase metadata: date (required), and the responsible person and general remarks, which stay
 * hidden until asked for.
 */
export const ExternalPurchaseSection: React.FC<ExternalPurchaseSectionProps> = ({ form }) => {
  const { register, watch, formState } = form;
  const { errors } = formState;
  const responsableFilled = hasValue(watch('responsable')) || !!errors.responsable;
  const observationsFilled = hasValue(watch('observations')) || !!errors.observations;

  return (
    <ExternalFormSection title="Datos de compra">
      <TextField
        {...register('purchase_date')}
        label="Fecha de compra"
        type="date"
        variant="filled"
        required
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: new Date().toISOString().slice(0, 10) }}
        error={!!errors.purchase_date}
        helperText={errors.purchase_date?.message}
        sx={filledSx}
      />

      <OptionalGroup
        addLabel="+ Responsable"
        filled={responsableFilled}
        onClear={() => clearFields(form, ['responsable'])}
      >
        <TextField
          {...register('responsable')}
          label="Responsable"
          variant="filled"
          error={!!errors.responsable}
          helperText={errors.responsable?.message}
          sx={filledSx}
        />
      </OptionalGroup>

      <OptionalGroup
        addLabel="+ Observaciones"
        filled={observationsFilled}
        onClear={() => clearFields(form, ['observations'])}
      >
        <TextField
          {...register('observations')}
          label="Observaciones"
          variant="filled"
          fullWidth
          multiline
          rows={2}
          error={!!errors.observations}
          helperText={errors.observations?.message}
          sx={filledSx}
        />
      </OptionalGroup>
    </ExternalFormSection>
  );
};

export default ExternalPurchaseSection;

import React, { useEffect } from 'react';
import { Alert, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useNextEntryOrderNumber } from '@/features/entry-orders/hooks/useEntryOrders';
import { ExternalBatchForm, ExternalFormSection, filledSx } from './externalFormParts';

interface ExternalBatchSectionProps {
  form: ExternalBatchForm;
  open: boolean;
  /** The number an existing draft already has; a new order previews the next one. */
  orderNumber?: number;
  /** What happens with the caravans in this mode, closing the note. */
  dteNote: string;
}

/**
 * Transit batch configuration: dynamically enabled based on animal destination.
 * When animals have an own destination, no transit batch is required.
 * When some or all animals have no destination, a transit batch receives them.
 */
export const ExternalBatchSection: React.FC<ExternalBatchSectionProps> = ({ form, open, orderNumber, dteNote }) => {
  const { watch, setValue, register, formState } = form;
  const { errors } = formState;
  const auction = (watch('auction_number') ?? '').trim();
  const mode = watch('batch_name_mode');
  const needsBatch = watch('needs_transit_batch');
  const { data: nextNumber } = useNextEntryOrderNumber(open && orderNumber == null);
  const number = orderNumber ?? nextNumber;

  // Without an auction there is nothing to compose the name from: the user writes it.
  useEffect(() => {
    if (auction === '' && mode === 'AUTO') setValue('batch_name_mode', 'CUSTOM');
  }, [auction, mode, setValue]);

  useEffect(() => {
    if (auction !== '' && mode === 'CUSTOM' && (watch('batch_name') ?? '') === '') setValue('batch_name_mode', 'AUTO');
    // Only when the auction appears: a name already typed is the user's decision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction]);

  const preview = auction !== '' ? `${auction}-${number ?? '…'}` : '';

  const modeToggle = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode}
      onChange={(_, next: 'AUTO' | 'CUSTOM' | null) => next && setValue('batch_name_mode', next, { shouldValidate: true })}
      aria-label="Cómo se nombra el lote"
    >
      <ToggleButton
        value="AUTO"
        disabled={auction === ''}
        sx={{
          px: 1.5,
          py: 0.25,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      >
        Automático
      </ToggleButton>
      <ToggleButton
        value="CUSTOM"
        sx={{
          px: 1.5,
          py: 0.25,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      >
        Personalizado
      </ToggleButton>
    </ToggleButtonGroup>
  );

  // The transit batch only exists when some animals are left to assign later ("Asignar después").
  if (!needsBatch) return null;

  return (
    <ExternalFormSection
      title="Lote de tránsito"
      action={modeToggle}
    >
      <TextField
        {...register('auction_number')}
        label="Terminación / N° de subasta (opcional)"
        placeholder="Ej: 338"
        variant="filled"
        fullWidth
        error={!!errors.auction_number}
        helperText={
          errors.auction_number?.message ??
          'Si la compra es de un remate, con ella se sugiere el nombre del lote.'
        }
        sx={filledSx}
      />
      {mode === 'AUTO' ? (
        <TextField
          label="Nombre del lote"
          value={preview}
          variant="filled"
          fullWidth
          InputProps={{ readOnly: true }}
          helperText={`Subasta y N° de orden${orderNumber == null ? ' (el número se confirma al guardar)' : ''}.`}
          sx={{ ...filledSx, '& input': { fontWeight: 700, fontFamily: 'monospace' } }}
        />
      ) : (
        <TextField
          {...register('batch_name')}
          label="Nombre del lote"
          variant="filled"
          fullWidth
          required
          InputLabelProps={{ shrink: (watch('batch_name') ?? '') !== '' || undefined }}
          error={!!errors.batch_name}
          helperText={errors.batch_name?.message ?? (auction === '' ? 'Sin subasta no hay nombre sugerido: escribilo.' : undefined)}
          sx={filledSx}
        />
      )}

      <Alert
        severity="info"
        sx={{ fontSize: '0.75rem', py: 0.5, '& .MuiAlert-message': { width: '100%', lineHeight: 1.3 } }}
      >
        <strong>Nota:</strong> recibe los animales que no tienen destino. Es un lote de tránsito, sin
        actividad ni tipo de lote: se clasifican cuando sus animales pasan a un lote propio. {dteNote}
      </Alert>
    </ExternalFormSection>
  );
};

export default ExternalBatchSection;

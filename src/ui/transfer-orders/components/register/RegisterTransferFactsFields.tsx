import React from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import type { RegisterTransferFacts } from '../../hooks/useRegisterTransferForm';

interface RegisterTransferFactsFieldsProps {
  facts: RegisterTransferFacts;
  onChange: (facts: RegisterTransferFacts) => void;
  today: string;
}

const fieldSx = { bgcolor: 'action.hover', '& .MuiFilledInput-root': { borderRadius: '6px' } };

/**
 * What only the person loading it knows: the day the animals moved, who was in charge, and
 * anything worth saying. The date starts on today and is changed when the movement was earlier.
 */
export const RegisterTransferFactsFields: React.FC<RegisterTransferFactsFieldsProps> = ({ facts, onChange, today }) => (
  <Stack spacing={1.5}>
    <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.5 }}>
      El hecho
    </Typography>

    <TextField
      type="date"
      label="Fecha del movimiento"
      required
      variant="filled"
      size="small"
      fullWidth
      value={facts.movementDate}
      onChange={(e) => onChange({ ...facts, movementDate: e.target.value })}
      inputProps={{ max: today }}
      InputLabelProps={{ shrink: true }}
      helperText={facts.movementDate && facts.movementDate !== today ? 'Se registra con esta fecha, no con la de hoy.' : 'El día en que se movieron los animales.'}
      sx={fieldSx}
    />

    <TextField
      label="Responsable"
      variant="filled"
      size="small"
      fullWidth
      value={facts.responsable}
      onChange={(e) => onChange({ ...facts, responsable: e.target.value })}
      inputProps={{ maxLength: 255 }}
      sx={fieldSx}
    />

    <TextField
      label="Observaciones"
      variant="filled"
      size="small"
      fullWidth
      multiline
      minRows={1}
      maxRows={3}
      value={facts.observations}
      onChange={(e) => onChange({ ...facts, observations: e.target.value })}
      inputProps={{ maxLength: 2000 }}
      sx={fieldSx}
    />
  </Stack>
);

export default RegisterTransferFactsFields;

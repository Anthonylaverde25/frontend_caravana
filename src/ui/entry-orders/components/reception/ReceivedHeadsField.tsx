import React from 'react';
import { Alert, InputBase, Stack, TextField, Typography } from '@mui/material';

const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } } as const;

const heads = (count: number) => (count === 1 ? '1 cabeza' : `${count} cabezas`);

/** The head written, or null while it is not a whole number. */
export const receivedHeadsOf = (value: string): number | null => {
  const count = Number(value);

  return value.trim() !== '' && Number.isInteger(count) && count >= 0 ? count : null;
};

interface ReceivedHeadsFieldProps {
  /** Head of the DTE in transit: what the count is confirmed against. */
  expected: number;
  value: string;
  onChange: (value: string) => void;
  /** Marked on click: the count is missing or less than the caravans. */
  error: string | null;
}

/**
 * "Cabezas recibidas": the DTE declares head, not caravans, so receiving it by hand is confirming
 * how many head arrived. That closes the DTE.
 */
export const ReceivedHeadsField: React.FC<ReceivedHeadsFieldProps> = ({ expected, value, onChange, error }) => (
  <TextField
    label="Cabezas recibidas"
    type="number"
    required
    variant="filled"
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    inputProps={{ min: 0 }}
    InputProps={{ disableUnderline: true }}
    error={Boolean(error)}
    helperText={error ?? `De ${heads(expected)} en tránsito`}
    sx={{ ...filledSx, width: 200 }}
  />
);

interface HeadsComparisonProps {
  expected: number;
  received: number;
  /** Why the count differs, for the incident. Optional. */
  note: string;
  onNote: (note: string) => void;
}

/**
 * The count against the DTE, in one line. A count other than the head in transit is not an error:
 * it is received as is and raises an incident to settle with the provider, with the note written
 * here.
 */
export const HeadsComparison: React.FC<HeadsComparisonProps> = ({ expected, received, note, onNote }) => {
  const difference = received - expected;

  return (
    <Alert
      severity={difference === 0 ? 'success' : 'warning'}
      sx={{ py: 0, borderRadius: '6px', alignItems: 'center', '& .MuiAlert-message': { width: '100%', py: 0.75 } }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
          {difference === 0
            ? 'Coincide con el DTE: se da por recibido.'
            : difference < 0
              ? `Faltan ${heads(-difference)}: el DTE se cierra con una novedad.`
              : `${heads(difference)} de más: se reciben con una novedad.`}
        </Typography>
        {difference !== 0 && (
          <InputBase
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Motivo (opcional), ej: murió uno en el viaje"
            sx={{ flex: 1, px: 1, fontSize: '0.82rem', bgcolor: 'background.paper', borderRadius: '4px', border: 1, borderColor: 'divider' }}
          />
        )}
      </Stack>
    </Alert>
  );
};

export default ReceivedHeadsField;

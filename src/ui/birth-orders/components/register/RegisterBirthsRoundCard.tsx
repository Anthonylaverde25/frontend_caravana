import React from 'react';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import type { RegisterBirthsHeader } from './registerBirths';

interface RegisterBirthsRoundCardProps {
  roundDate: string;
  maxDate: string;
  onRoundDate: (date: string) => void;
  /** Rows with a result and still without a date. */
  missingDates: number;
  onFillDates: () => void;
  header: RegisterBirthsHeader;
  onHeader: (header: RegisterBirthsHeader) => void;
}

/**
 * The round: the day it was walked and who walked it. The day goes into the rows only when asked
 * ("Usarla en N filas"): a calving date is declared, never inferred.
 */
export const RegisterBirthsRoundCard: React.FC<RegisterBirthsRoundCardProps> = (props) => {
  const { roundDate, maxDate, onRoundDate, missingDates, onFillDates, header, onHeader } = props;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>2. Recorrida</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <TextField
          label="Fecha de la recorrida"
          type="date"
          variant="filled"
          fullWidth
          value={roundDate}
          onChange={(e) => onRoundDate(e.target.value)}
          inputProps={{ max: maxDate }}
          InputLabelProps={{ shrink: true }}
          InputProps={filledInputProps}
        />
        <Button
          variant="outlined"
          fullWidth
          disabled={missingDates === 0 || !roundDate}
          onClick={onFillDates}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Usarla en {missingDates} fila(s) sin fecha
        </Button>
        <TextField
          label="Responsable de la recorrida"
          variant="filled"
          fullWidth
          value={header.responsable}
          onChange={(e) => onHeader({ ...header, responsable: e.target.value })}
          InputProps={filledInputProps}
        />
        <TextField
          label="Observaciones"
          variant="filled"
          fullWidth
          multiline
          minRows={2}
          value={header.observations}
          onChange={(e) => onHeader({ ...header, observations: e.target.value })}
          InputProps={filledInputProps}
        />
      </Stack>
    </Paper>
  );
};

export default RegisterBirthsRoundCard;

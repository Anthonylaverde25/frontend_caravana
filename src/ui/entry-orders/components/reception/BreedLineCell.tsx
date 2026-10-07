import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import type { ReceptionTroopContext } from './useReceptionRows';

interface BreedLineCellProps {
  value: number | '';
  breeds: ReceptionTroopContext['breeds'];
  error: boolean;
  warn: boolean;
  onChange: (position: number | '') => void;
}

/**
 * The breed line of a caravan, by its full name ("Braford Colorado"): on screen there is room for
 * the words, so nothing is asked by letter, whatever the paper uses.
 */
export const BreedLineCell: React.FC<BreedLineCellProps> = ({ value, breeds, error, warn, onChange }) => (
  <TextField
    select
    size="small"
    variant="filled"
    hiddenLabel
    fullWidth
    value={value === '' ? '' : String(value)}
    error={error}
    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    SelectProps={{ displayEmpty: true }}
    InputProps={{ disableUnderline: true }}
    sx={{
      '& .MuiFilledInput-root': {
        bgcolor: 'action.hover',
        borderRadius: '4px',
        fontSize: '0.8rem',
        border: '1px solid',
        borderColor: error ? 'error.main' : warn ? 'warning.main' : 'transparent'
      },
      '& .MuiSelect-select': { py: 0.5 }
    }}
  >
    <MenuItem value="" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
      Sin declarar
    </MenuItem>
    {breeds.map((breed) => (
      <MenuItem key={breed.position} value={String(breed.position)} sx={{ fontSize: '0.8rem' }}>
        {breed.label}
      </MenuItem>
    ))}
  </TextField>
);

export default BreedLineCell;

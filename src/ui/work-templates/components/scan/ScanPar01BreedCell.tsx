import React from 'react';
import { MenuItem, SxProps, TextField, Theme } from '@mui/material';
import { findBreed } from './par01Catalog';

interface ScanPar01BreedCellProps {
  /** The breed as read off the paper, or as chosen: a name of the catalog. */
  value: string;
  breeds: { id: number; name: string }[];
  error: boolean;
  disabled: boolean;
  sx: SxProps<Theme>;
  onChange: (value: string) => void;
}

/**
 * The breed of the calf, chosen from the catalog. A reading that matches a breed of the catalog
 * (accents, case and spaces aside, as the server matches it) is selected; a blank one waits to be
 * chosen; one that is not in the catalog stays visible as read, marked, until it is corrected.
 */
export const ScanPar01BreedCell: React.FC<ScanPar01BreedCellProps> = ({ value, breeds, error, disabled, sx, onChange }) => {
  const read = value.trim();
  const match = findBreed(breeds.map((b) => ({ ...b, colors: [] })), read);
  const unknown = read !== '' && !match && breeds.length > 0;

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      disabled={disabled}
      error={error || unknown}
      value={match ? match.name : read}
      onChange={(e) => onChange(e.target.value)}
      SelectProps={{ displayEmpty: true }}
      sx={sx}
    >
      <MenuItem value="">
        <em>Sin raza</em>
      </MenuItem>
      {breeds.map((breed) => (
        <MenuItem key={breed.id} value={breed.name}>
          {breed.name}
        </MenuItem>
      ))}
      {(unknown || (read !== '' && breeds.length === 0)) && <MenuItem value={read}>Leído: «{read}»</MenuItem>}
    </TextField>
  );
};

export default ScanPar01BreedCell;

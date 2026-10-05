import React from 'react';
import { MenuItem, SxProps, TextField, Theme } from '@mui/material';
import { allCoats, findBreed, findCoat, Par01BreedOption } from './par01Catalog';

interface ScanPar01CoatCellProps {
  /** The coat (pelaje) as read off the paper, or as chosen: a name of the catalog. */
  value: string;
  /** The breed of the same row: it limits the coats offered. */
  breed: string;
  breeds: Par01BreedOption[];
  error: boolean;
  disabled: boolean;
  sx: SxProps<Theme>;
  onChange: (value: string) => void;
}

/**
 * The coat of the calf, as an entry order chooses it: with a breed, only the coats that breed
 * admits; without one, any coat of the catalog. A reading that is not in the catalog, or that the
 * breed does not admit, stays visible as read, marked, until it is corrected.
 */
export const ScanPar01CoatCell: React.FC<ScanPar01CoatCellProps> = ({ value, breed, breeds, error, disabled, sx, onChange }) => {
  const read = value.trim();
  const chosenBreed = findBreed(breeds, breed);
  const options = chosenBreed ? chosenBreed.colors : allCoats(breeds);
  const match = read ? findCoat(options, read) : undefined;
  const catalogLoaded = breeds.length > 0;
  const invalid = read !== '' && !match && catalogLoaded;
  const reason = chosenBreed && findCoat(allCoats(breeds), read) ? ` · no es de ${chosenBreed.name}` : '';

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      disabled={disabled}
      error={error || invalid}
      value={match ? match.name : read}
      onChange={(e) => onChange(e.target.value)}
      SelectProps={{ displayEmpty: true }}
      sx={sx}
    >
      <MenuItem value="">
        <em>{chosenBreed && options.length === 0 ? 'La raza no tiene pelajes' : 'Sin pelaje'}</em>
      </MenuItem>
      {options.map((coat) => (
        <MenuItem key={coat.id} value={coat.name}>
          {coat.name}
        </MenuItem>
      ))}
      {read !== '' && !match && (
        <MenuItem value={read}>
          Leído: «{read}»{reason}
        </MenuItem>
      )}
    </TextField>
  );
};

export default ScanPar01CoatCell;

import React from 'react';
import { MenuItem, SxProps, TableCell, TextField, Theme } from '@mui/material';
import type { BreedColor } from '@/core/breeds/domain/entities/Breed';

export interface BirthBreedOption {
  id: number;
  name: string;
  /** The coats (pelajes) the breed admits. */
  colors: BreedColor[];
}

interface BirthBreedCoatCellsProps {
  breedId: number | '';
  colorId: number | '';
  breeds: BirthBreedOption[];
  disabled: boolean;
  breedError: boolean;
  colorError: boolean;
  cellSx: SxProps<Theme>;
  inputSx: SxProps<Theme>;
  onChange: (change: { calfBreedId?: number | ''; calfColorId?: number | '' }) => void;
}

/**
 * The breed and the coat (pelaje) of a live calf, as an entry order chooses them: the coats offered
 * are the ones the breed admits; without a breed, any coat of the catalog. Changing the breed drops
 * a coat it does not admit.
 */
export const BirthBreedCoatCells: React.FC<BirthBreedCoatCellsProps> = ({ breedId, colorId, breeds, disabled, breedError, colorError, cellSx, inputSx, onChange }) => {
  const breed = breedId === '' ? undefined : breeds.find((b) => b.id === breedId);
  const allCoats = [...new Map(breeds.flatMap((b) => b.colors).map((c) => [c.id, c])).values()].sort((a, b) => a.name.localeCompare(b.name));
  const coats = breed ? breed.colors : allCoats;

  const changeBreed = (next: number | '') => {
    const admits = next === '' || colorId === '' || (breeds.find((b) => b.id === next)?.colors ?? []).some((c) => c.id === colorId);

    onChange({ calfBreedId: next, ...(admits ? {} : { calfColorId: '' }) });
  };

  return (
    <>
      <TableCell sx={cellSx}>
        <TextField
          select
          fullWidth
          variant="outlined"
          disabled={disabled}
          error={breedError}
          value={breedId}
          onChange={(e) => changeBreed(e.target.value === '' ? '' : Number(e.target.value))}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>Sin raza</em>
          </MenuItem>
          {breeds.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell sx={cellSx}>
        <TextField
          select
          fullWidth
          variant="outlined"
          disabled={disabled || (breed !== undefined && coats.length === 0)}
          error={colorError}
          value={coats.some((c) => c.id === colorId) ? colorId : ''}
          onChange={(e) => onChange({ calfColorId: e.target.value === '' ? '' : Number(e.target.value) })}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>{breed && coats.length === 0 ? 'La raza no tiene pelajes' : 'Sin pelaje'}</em>
          </MenuItem>
          {coats.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
    </>
  );
};

export default BirthBreedCoatCells;

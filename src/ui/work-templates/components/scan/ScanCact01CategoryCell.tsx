import React, { useMemo } from 'react';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { categoryOptions } from '@/features/categories/categoryLabels';
import type { Cact01Error } from './types';

interface ScanCact01CategoryCellProps {
  value: string;
  onChange: (value: string) => void;
  /** The sex of the row as read, to offer only the options that fit it. */
  sex: string;
  errors: Cact01Error[];
  edited: boolean;
  /** What an empty cell means: "No cambia" for C/S nueva, "—" for the current category. */
  placeholder?: string;
  /** The value was filled from what the system knows of the animal, not read off the paper. */
  fromSystem?: boolean;
}

/** Shown on a cell the screen filled itself, so it is not taken for what the paper said. */
export const SYSTEM_FILLED_HINT = 'No lo leyó el escaneo: es lo que el sistema tiene para esta caravana.';

/** Grey and italic: visibly a value nobody wrote. */
export const systemFilledInputSx = { '& .MuiInputBase-input': { color: 'text.secondary', fontStyle: 'italic' } };

/** The row errors that are about this cell, so the cell itself is the one marked. */
const CATEGORY_ERROR_CODES = new Set(['CATEGORY_TEXT_AMBIGUOUS', 'CATEGORY_TEXT_NOT_FOUND', 'CATEGORY_SEX_MISMATCH']);

/**
 * A C/S cell of the review — C/S nueva, or the current category — : what the chute wrote, kept
 * as text, with the catalog one keystroke away.
 *
 * Free text on purpose. "Reposición" or "NOV" are valid as written and the backend resolves
 * them; the list is there for the cells it could not resolve — ambiguous, unknown, or of the
 * other sex — which come back marked, and picking an option writes its canonical label, which
 * always resolves to itself.
 */
export const ScanCact01CategoryCell: React.FC<ScanCact01CategoryCellProps> = ({
  value,
  onChange,
  sex,
  errors,
  edited,
  placeholder = 'No cambia',
  fromSystem = false,
}) => {
  const { categories } = useAnimalCategories();
  const normalizedSex = sex.trim().toUpperCase().startsWith('H') ? 'H' : sex.trim().toUpperCase().startsWith('M') ? 'M' : null;
  const options = useMemo(() => categoryOptions(categories, normalizedSex), [categories, normalizedSex]);
  const cellErrors = errors.filter((error) => CATEGORY_ERROR_CODES.has(error.code));
  const marked = cellErrors.length > 0 && !edited;

  return (
    <Tooltip title={marked ? cellErrors.map((error) => error.message).join(' ') : fromSystem ? SYSTEM_FILLED_HINT : ''}>
      <Autocomplete
        freeSolo
        size="small"
        options={options.map((option) => option.label)}
        groupBy={(label) => options.find((option) => option.label === label)?.group ?? ''}
        inputValue={value}
        onInputChange={(_, next) => onChange(next)}
        renderInput={(params) => (
          <TextField {...params} placeholder={placeholder} error={marked} sx={fromSystem ? systemFilledInputSx : undefined} />
        )}
        fullWidth
      />
    </Tooltip>
  );
};

export default ScanCact01CategoryCell;

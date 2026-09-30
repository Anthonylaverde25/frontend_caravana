import React from 'react';
import { InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import CategoryChangeCell, { CategoryChangeFlag } from '@/components/caravan/CategoryChangeCell';
import {
  RegisterFieldAnimal,
  RegisterFieldDraft,
  isCategoryChange,
  teethLabel,
  teethOptionsFrom
} from '../registerFieldData';

interface FieldProps {
  animal: RegisterFieldAnimal;
  draft: RegisterFieldDraft | undefined;
  onChange: (patch: Partial<RegisterFieldDraft>) => void;
}

/** A changed value is tinted, so what will be written reads at a glance down the column. */
const inputSx = (changed: boolean, error = false) => ({
  '& .MuiInputBase-root': { fontSize: '0.8rem', bgcolor: changed ? 'action.selected' : 'background.paper' },
  '& .MuiInputBase-input': { py: 0.6 },
  ...(error ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'error.main' } } : {})
});

/** Empty means no change: the current weight is the placeholder. */
export const WeightInput: React.FC<FieldProps & { invalid: boolean }> = ({ animal, draft, onChange, invalid }) => (
  <TextField
    size="small"
    value={draft?.weight ?? ''}
    onChange={(e) => onChange({ weight: e.target.value })}
    placeholder={animal.currentWeight != null ? `${animal.currentWeight}` : '—'}
    inputProps={{ inputMode: 'decimal', 'aria-label': `Peso de ${animal.identification}`, style: { textAlign: 'right' } }}
    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
    sx={{ width: 118, ...inputSx(Boolean(draft?.weight), invalid) }}
  />
);

/** Dentition only advances: the options start above the current reading. */
export const TeethSelect: React.FC<FieldProps> = ({ animal, draft, onChange }) => {
  const options = teethOptionsFrom(animal.teeth);

  return (
    <TextField
      select
      size="small"
      fullWidth
      value={draft?.teeth ?? ''}
      onChange={(e) => onChange({ teeth: e.target.value || undefined })}
      disabled={options.length === 0}
      SelectProps={{ displayEmpty: true }}
      inputProps={{ 'aria-label': `Dientes de ${animal.identification}` }}
      sx={inputSx(Boolean(draft?.teeth))}
    >
      <MenuItem value="">
        <Typography component="span" variant="body2" color="text.secondary">
          {teethLabel(animal.teeth)} (actual)
        </Typography>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

/**
 * C/S actual → C/S nueva. The current category is only the reference that identifies the animal;
 * the change is declared in its own field, empty by default, as on the sheet.
 */
export const CategoryChangeInput: React.FC<FieldProps & { flags: CategoryChangeFlag[] }> = ({
  animal,
  draft,
  onChange,
  flags
}) => (
  <CategoryChangeCell
    current={animal.categoryId != null ? { categoryId: animal.categoryId, subcategoryId: animal.subcategoryId } : null}
    value={isCategoryChange(draft?.category, animal) ? (draft?.category ?? null) : null}
    onChange={(value) => onChange({ category: value ?? undefined })}
    sex={animal.sex}
    flags={flags}
    ariaLabel={`C/S nueva de ${animal.identification}`}
  />
);

export const ObservationsInput: React.FC<FieldProps> = ({ animal, draft, onChange }) => (
  <TextField
    size="small"
    fullWidth
    value={draft?.observations ?? ''}
    onChange={(e) => onChange({ observations: e.target.value })}
    placeholder="Sin observaciones"
    inputProps={{ maxLength: 500, 'aria-label': `Observaciones de ${animal.identification}` }}
    sx={inputSx(Boolean(draft?.observations?.trim()))}
  />
);

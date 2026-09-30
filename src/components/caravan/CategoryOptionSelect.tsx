import React, { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { CategoryOption, categoryOptions, optionKey } from '@/features/categories/categoryLabels';

interface CategoryOptionSelectProps {
  value: { categoryId: number; subcategoryId: number | null } | null;
  onChange: (value: { categoryId: number; subcategoryId: number | null } | null) => void;
  /** Only the options an animal of this sex can take. Mixed or unknown: every option. */
  sex?: 'M' | 'H' | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'small' | 'medium';
}

/**
 * A C/S value picked from the catalog: a category, or a category narrowed to a subcategory,
 * grouped by category and written exactly as the sheet prints it.
 *
 * Shared by the transfer order (what the desk declares) and the scan review (what the chute
 * wrote, when it did not resolve on its own), so both speak the same labels.
 */
export const CategoryOptionSelect: React.FC<CategoryOptionSelectProps> = ({
  value,
  onChange,
  sex = null,
  placeholder = 'No cambia',
  disabled = false,
  error = false,
  size = 'small'
}) => {
  const { categories, isLoading } = useAnimalCategories();
  const options = useMemo(() => categoryOptions(categories, sex), [categories, sex]);
  const selected = value
    ? (options.find((o) => o.key === optionKey(value.categoryId, value.subcategoryId)) ?? null)
    : null;

  return (
    <Autocomplete<CategoryOption>
      size={size}
      options={options}
      value={selected}
      loading={isLoading}
      disabled={disabled}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.key === b.key}
      onChange={(_, next) => onChange(next ? { categoryId: next.categoryId, subcategoryId: next.subcategoryId } : null)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          placeholder={placeholder}
          error={error}
          hiddenLabel
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } }}
        />
      )}
      sx={{ minWidth: 220 }}
    />
  );
};

export default CategoryOptionSelect;

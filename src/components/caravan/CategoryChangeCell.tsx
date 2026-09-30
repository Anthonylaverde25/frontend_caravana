import React, { useMemo } from 'react';
import { Chip, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { categoryOptions, labelOfPair, optionKey } from '@/features/categories/categoryLabels';

export interface CategoryPairValue {
  categoryId: number;
  subcategoryId: number | null;
}

/** A warning shown under the cell: what the backend will also say, seen before confirming. */
export interface CategoryChangeFlag {
  label: string;
  tooltip: string;
}

interface CategoryChangeCellProps {
  /** What the system has now: shown greyed, as the reference that identifies the animal. */
  current: CategoryPairValue | null;
  /** The declared new C/S; null is "no change". */
  value: CategoryPairValue | null;
  onChange: (value: CategoryPairValue | null) => void;
  sex: 'M' | 'H' | null;
  flags?: CategoryChangeFlag[];
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * C/S actual → C/S nueva, the way the sheet has it.
 *
 * The category the system holds is never offered as the answer: it may be the last one recorded
 * and not the one the animal has at the chute. It is shown as a reference, and a change is
 * declared in its own field, empty by default. Choosing the current pair is the same as leaving
 * it empty.
 */
export const CategoryChangeCell: React.FC<CategoryChangeCellProps> = ({
  current,
  value,
  onChange,
  sex,
  flags = [],
  disabled = false,
  ariaLabel = 'C/S nueva'
}) => {
  const { categories } = useAnimalCategories();
  const options = useMemo(() => categoryOptions(categories, sex), [categories, sex]);
  const currentKey = current ? optionKey(current.categoryId, current.subcategoryId) : '';
  const currentLabel = current ? labelOfPair(categories, current.categoryId, current.subcategoryId) : null;
  const selectedKey = value ? optionKey(value.categoryId, value.subcategoryId) : '';

  const select = (key: string) => {
    const option = options.find((o) => o.key === key);

    onChange(option && key !== currentKey ? { categoryId: option.categoryId, subcategoryId: option.subcategoryId } : null);
  };

  return (
    <Stack spacing={0.5} sx={{ minWidth: 220 }}>
      <Typography variant="caption" noWrap sx={{ color: 'text.disabled', lineHeight: 1.2 }} title="C/S actual (sistema)">
        {currentLabel ?? 'Sin categoría'}
      </Typography>
      <TextField
        select
        size="small"
        fullWidth
        disabled={disabled}
        value={options.some((o) => o.key === selectedKey) ? selectedKey : ''}
        onChange={(e) => select(e.target.value)}
        SelectProps={{ displayEmpty: true }}
        inputProps={{ 'aria-label': ariaLabel }}
        sx={{
          '& .MuiInputBase-root': { fontSize: '0.8rem', bgcolor: value ? 'action.selected' : 'background.paper' },
          '& .MuiInputBase-input': { py: 0.6 }
        }}
      >
        <MenuItem value="">
          <Typography component="span" variant="body2" color="text.secondary">
            No cambia
          </Typography>
        </MenuItem>
        {/* The category leads its group in bold; its subcategories follow, indented. */}
        {options.map((option) => (
          <MenuItem
            key={option.key}
            value={option.key}
            sx={{ pl: option.subcategoryId != null ? 4 : 2, fontWeight: option.subcategoryId == null ? 700 : 400 }}
          >
            {option.label}
            {option.key === currentKey ? ' (actual)' : ''}
          </MenuItem>
        ))}
      </TextField>
      {flags.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {flags.map((flag) => (
            <Tooltip key={flag.label} title={flag.tooltip}>
              <Chip size="small" color="warning" variant="outlined" label={flag.label} sx={{ height: 20, fontSize: '0.68rem' }} />
            </Tooltip>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default CategoryChangeCell;

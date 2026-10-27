import { MenuItem, TextField } from '@mui/material';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';

interface PlannedSemenCellProps {
  value: number | null;
  options: SemenOption[];
  disabled?: boolean;
  onChange: (itemId: number | null) => void;
}

/** Semen planned for one female (IA4): optional, left blank to decide at the chute. */
export default function PlannedSemenCell({ value, options, disabled, onChange }: PlannedSemenCellProps) {
  return (
    <TextField
      select
      size="small"
      fullWidth
      variant="standard"
      value={value ?? ''}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      SelectProps={{ displayEmpty: true }}
      InputProps={{ disableUnderline: true, sx: { fontSize: '0.78rem' } }}
    >
      <MenuItem value="" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
        Se decide en la manga
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.itemId} value={option.itemId} sx={{ fontSize: '0.8rem' }}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

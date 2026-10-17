import { InputBase, TableCell } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { KeyboardEvent } from 'react';
import { sheetCellSx } from './sheetStyles';

interface CageSheetCellProps {
  value: string;
  row: number;
  column: number;
  label: string;
  error?: boolean;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>, row: number, column: number) => void;
}

/** One editable cell: borderless input, right-aligned digits, outlined while focused. */
export function CageSheetCell({ value, row, column, label, error, onChange, onKeyDown }: CageSheetCellProps) {
  return (
    <TableCell
      sx={(theme) => ({
        ...sheetCellSx(theme),
        bgcolor: error ? alpha(theme.palette.error.main, 0.06) : 'background.paper',
        '&:focus-within': { boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}` },
      })}
    >
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
        onKeyDown={(e) => onKeyDown(e as KeyboardEvent<HTMLInputElement>, row, column)}
        onFocus={(e) => e.target.select()}
        inputProps={{
          inputMode: 'decimal',
          'aria-label': label,
          'data-sheet-cell': `${row}:${column}`,
          style: { textAlign: 'right', padding: '0 10px', height: 36, fontVariantNumeric: 'tabular-nums' },
        }}
        fullWidth
      />
    </TableCell>
  );
}

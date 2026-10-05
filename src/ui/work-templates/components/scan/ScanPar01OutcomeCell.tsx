import React from 'react';
import { MenuItem, SxProps, TextField, Theme } from '@mui/material';
import {
  BIRTH_OUTCOMES,
  BIRTH_OUTCOME_LABELS,
  BIRTH_OUTCOME_MARKS,
  OVERDUE_MARK,
  birthSheetMarkText,
  parseBirthSheetMark
} from '@/features/birth-orders/types';

interface ScanPar01OutcomeCellProps {
  /** The "resultado" cell as read: "V", "N", "N, NM" … */
  value: string;
  error: boolean;
  disabled: boolean;
  sx: SxProps<Theme>;
  onChange: (value: string) => void;
}

/**
 * The four boxes of the paper, reviewed as one choice: Parió (V) / Nació muerto (NM) / Murió (M) /
 * No parió (N). A reading of N with an outcome ("N, V": she did not calve in time and calved later)
 * is kept as read; choosing the outcome alone registers the same calving. A reading that is not a
 * mark (two outcomes, an A) stays visible as read until it is corrected.
 */
export const ScanPar01OutcomeCell: React.FC<ScanPar01OutcomeCellProps> = ({ value, error, disabled, sx, onChange }) => {
  const mark = parseBirthSheetMark(value);
  const unreadable = mark.ambiguous || mark.abortion;
  const lateCalving = mark.overdue && mark.outcome !== null;
  const selected = unreadable
    ? value
    : lateCalving
      ? birthSheetMarkText(mark.outcome, true)
      : mark.outcome
        ? BIRTH_OUTCOME_MARKS[mark.outcome]
        : mark.overdue
          ? OVERDUE_MARK
          : '';

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      disabled={disabled}
      error={error || unreadable}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      SelectProps={{ displayEmpty: true }}
      sx={sx}
    >
      <MenuItem value="">
        <em>Sin marcar (pendiente)</em>
      </MenuItem>
      {BIRTH_OUTCOMES.map((o) => (
        <MenuItem key={o} value={BIRTH_OUTCOME_MARKS[o]}>
          {BIRTH_OUTCOME_MARKS[o]} · {BIRTH_OUTCOME_LABELS[o]}
        </MenuItem>
      ))}
      <MenuItem value={OVERDUE_MARK}>{OVERDUE_MARK} · No parió (parto vencido)</MenuItem>
      {lateCalving && mark.outcome && (
        <MenuItem value={selected}>
          {selected} · No parió y después {BIRTH_OUTCOME_LABELS[mark.outcome].toLowerCase()}
        </MenuItem>
      )}
      {unreadable && <MenuItem value={value}>Leído: «{value}»</MenuItem>}
    </TextField>
  );
};

export default ScanPar01OutcomeCell;

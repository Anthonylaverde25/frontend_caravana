import React from 'react';
import { Box, MenuItem, SxProps, TextField, Theme, Typography } from '@mui/material';
import { BIRTH_OUTCOMES, BIRTH_OUTCOME_LABELS, BIRTH_OUTCOME_MARKS, BirthOutcome, OVERDUE_MARK } from '@/features/birth-orders/types';
import { formatDate } from '../birthOrderFormat';

interface BirthOutcomeCellProps {
  outcome: BirthOutcome | '';
  overdue: boolean;
  /** The day of an N already reported: the alert is shown, and not asked again. */
  overdueReportedAt: string | null;
  /** A registration leaves nothing open, so it never offers the N. */
  allowOverdue: boolean;
  error: boolean;
  sx: SxProps<Theme>;
  onChange: (change: { outcome: BirthOutcome | ''; overdue: boolean }) => void;
}

const OUTCOME_COLOR: Record<BirthOutcome, string> = {
  LIVE: 'success.main',
  STILLBORN: 'error.main',
  PERINATAL_DEATH: 'warning.dark',
  ABORTION: 'error.main'
};

/**
 * What the round found for one female, as one choice: Parió / Nació muerto / Murió al pie / No
 * parió (N, an alert of a female past her due date). A female already overdue does not offer the N
 * again: choosing an outcome registers her calving and closes the alert.
 */
export const BirthOutcomeCell: React.FC<BirthOutcomeCellProps> = ({ outcome, overdue, overdueReportedAt, allowOverdue, error, sx, onChange }) => {
  const selected = outcome !== '' ? outcome : overdue ? OVERDUE_MARK : '';
  const color = outcome !== '' ? OUTCOME_COLOR[outcome] : overdue ? 'warning.dark' : 'text.disabled';

  return (
    <Box>
      <TextField
        select
        fullWidth
        variant="outlined"
        error={error}
        value={selected}
        onChange={(e) =>
          onChange(e.target.value === OVERDUE_MARK ? { outcome: '', overdue: true } : { outcome: e.target.value as BirthOutcome | '', overdue: false })
        }
        SelectProps={{ displayEmpty: true }}
        sx={[...(Array.isArray(sx) ? sx : [sx]), { '& .MuiSelect-select': { fontWeight: 700, color } }]}
      >
        <MenuItem value="">
          <em>{overdueReportedAt ? 'Sigue sin parir' : 'Sin parir aún'}</em>
        </MenuItem>
        {BIRTH_OUTCOMES.map((option) => (
          <MenuItem key={option} value={option}>
            {BIRTH_OUTCOME_MARKS[option]} · {BIRTH_OUTCOME_LABELS[option]}
          </MenuItem>
        ))}
        {allowOverdue && !overdueReportedAt && <MenuItem value={OVERDUE_MARK}>{OVERDUE_MARK} · No parió en fecha</MenuItem>}
      </TextField>

      {overdueReportedAt && (
        <Typography variant="caption" sx={{ display: 'block', px: 1.5, pb: 0.5, color: 'warning.dark', fontWeight: 700, fontSize: '0.66rem' }}>
          Parto vencido · avisado el {formatDate(overdueReportedAt)}
        </Typography>
      )}
    </Box>
  );
};

export default BirthOutcomeCell;

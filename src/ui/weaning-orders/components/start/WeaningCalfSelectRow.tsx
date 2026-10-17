import React from 'react';
import { Checkbox, TableCell, TableRow, Typography } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';

interface WeaningCalfSelectRowProps {
  calf: BirthHistoryRecord;
  chosen: boolean;
  onToggle: () => void;
}

const sexLabel = (sex: string | null) => (sex === 'M' ? 'Macho' : sex === 'H' ? 'Hembra' : '—');

/** One calf at foot of the selector: a click anywhere on the row picks it or drops it. */
export const WeaningCalfSelectRow: React.FC<WeaningCalfSelectRowProps> = ({ calf, chosen, onToggle }) => {
  const { indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();

  return (
    <TableRow hover onClick={onToggle} sx={{ cursor: 'pointer', '&:nth-of-type(even)': { bgcolor: zebraBg }, ...(chosen && { bgcolor: `${selectedBg} !important` }) }}>
      <TableCell align="center" sx={{ ...indexSx, width: 44 }}>
        <Checkbox size="small" checked={chosen} tabIndex={-1} disableRipple />
      </TableCell>
      <TableCell sx={textCellSx}>
        <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'primary.main' }}>
          {calf.calf_identification}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...textCellSx, fontFamily: 'monospace' }}>{calf.mother_identification}</TableCell>
      <TableCell sx={textCellSx}>{sexLabel(calf.calf_sex)}</TableCell>
      <TableCell sx={{ ...textCellSx, color: 'text.secondary', whiteSpace: 'nowrap' }}>{calf.birth_date}</TableCell>
    </TableRow>
  );
};

export default WeaningCalfSelectRow;

import React from 'react';
import { Checkbox, TableCell, TableRow, Typography } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { dueLabel, stageLabel } from '../birthOrderFormat';
import type { BirthRollFemale } from '../grid/birthRollTypes';

interface PregnantFemaleSelectRowProps {
  female: BirthRollFemale;
  chosen: boolean;
  onToggle: () => void;
}

const sireText = (count: number, names: string) => (count === 0 ? 'Sin toro' : count === 1 ? names : `${count} candidatos`);

/** One pregnant female of the selector: a click anywhere on the row picks it or drops it. */
export const PregnantFemaleSelectRow: React.FC<PregnantFemaleSelectRowProps> = ({ female, chosen, onToggle }) => {
  const { indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();

  return (
    <TableRow hover onClick={onToggle} sx={{ cursor: 'pointer', '&:nth-of-type(even)': { bgcolor: zebraBg }, ...(chosen && { bgcolor: `${selectedBg} !important` }) }}>
      <TableCell align="center" sx={{ ...indexSx, width: 44 }}>
        <Checkbox size="small" checked={chosen} tabIndex={-1} disableRipple />
      </TableCell>
      <TableCell sx={textCellSx}>
        <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'primary.main' }}>
          {female.identification}
        </Typography>
        <Typography component="span" variant="caption" color="text.secondary">
          {' '}
          · {female.categoryLabel ?? 'Vientre'}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...textCellSx, whiteSpace: 'nowrap' }}>{dueLabel(female.dueDate)}</TableCell>
      <TableCell sx={textCellSx}>{stageLabel(female.stage)}</TableCell>
      <TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>{sireText(female.sires.length, female.sires.map((s) => s.identification).join(', '))}</TableCell>
    </TableRow>
  );
};

export default PregnantFemaleSelectRow;

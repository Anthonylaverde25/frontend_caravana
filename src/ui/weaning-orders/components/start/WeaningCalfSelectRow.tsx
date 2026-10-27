import React from 'react';
import { Checkbox, MenuItem, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { DestinationChoice } from './useCalfDestinations';
import type { CalfMeasure } from './useCalfMeasures';

/** The "Lote destino" cell, when the order sends each calf to its own batch. */
export interface CalfDestinationCell {
  choices: DestinationChoice[];
  /** What an empty cell means: decided at the chute (orders) or still to choose (registers). */
  emptyLabel: string;
  refOf: (calfId: number) => string | null;
  onChange: (calfId: number, ref: string | null) => void;
}

/** The "Peso (kg)" and "Observaciones" cells, when the weaning already happened. */
export interface CalfMeasureCells {
  valueOf: (calfId: number) => CalfMeasure;
  onChange: (calfId: number, patch: Partial<CalfMeasure>) => void;
}

interface WeaningCalfSelectRowProps {
  calf: BirthHistoryRecord;
  chosen: boolean;
  onToggle: () => void;
  destination?: CalfDestinationCell;
  measures?: CalfMeasureCells;
}

const sexLabel = (sex: string | null) => (sex === 'M' ? 'Macho' : sex === 'H' ? 'Hembra' : '—');

/**
 * One calf at foot of the selector: a click anywhere on the row picks it or drops it. With a batch
 * per calf, its "Lote destino" is chosen in its own cell once the calf is picked; a weaning that
 * already happened also takes its weight and notes. Until the calf is picked those cells stay
 * visible, disabled.
 */
export const WeaningCalfSelectRow: React.FC<WeaningCalfSelectRowProps> = ({ calf, chosen, onToggle, destination, measures }) => {
  const { cellSx, inputSx, indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();
  const measure = measures && chosen ? measures.valueOf(calf.calf_id) : { weight: '', observations: '' };
  // Typing in a cell must not drop the calf: the row toggles on click.
  const keepRow = (e: React.MouseEvent) => chosen && e.stopPropagation();

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
      {destination && (
        <TableCell sx={{ ...cellSx, ...inputSx }} onClick={keepRow}>
          <TextField
            select
            size="small"
            fullWidth
            disabled={!chosen}
            value={chosen ? (destination.refOf(calf.calf_id) ?? '') : ''}
            onChange={(e) => destination.onChange(calf.calf_id, e.target.value || null)}
            SelectProps={{ displayEmpty: true }}
            inputProps={{ 'aria-label': `Lote destino de ${calf.calf_identification}` }}
          >
            <MenuItem value="">
              <Typography variant="body2" color="text.secondary">
                {chosen ? destination.emptyLabel : ''}
              </Typography>
            </MenuItem>
            {destination.choices.map((choice) => (
              <MenuItem key={choice.ref} value={choice.ref}>
                {choice.label}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>
      )}
      {measures && (
        <TableCell sx={{ ...cellSx, ...inputSx }} onClick={keepRow}>
          <TextField
            size="small"
            fullWidth
            disabled={!chosen}
            value={measure.weight}
            onChange={(e) => measures.onChange(calf.calf_id, { weight: e.target.value })}
            placeholder={chosen ? 'Opcional' : ''}
            inputProps={{ inputMode: 'decimal', 'aria-label': `Peso de ${calf.calf_identification}` }}
          />
        </TableCell>
      )}
      {measures && (
        <TableCell sx={{ ...cellSx, ...inputSx }} onClick={keepRow}>
          <TextField
            size="small"
            fullWidth
            disabled={!chosen}
            value={measure.observations}
            onChange={(e) => measures.onChange(calf.calf_id, { observations: e.target.value })}
            inputProps={{ 'aria-label': `Observaciones de ${calf.calf_identification}` }}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

export default WeaningCalfSelectRow;

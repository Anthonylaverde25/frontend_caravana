import React from 'react';
import { Box, IconButton, MenuItem, TableCell, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { dueLabel, stageLabel } from '../birthOrderFormat';
import BirthBreedCoatCells, { BirthBreedOption } from './BirthBreedCoatCells';
import BirthOutcomeCell from './BirthOutcomeCell';
import BirthSireCell from './BirthSireCell';
import type { BirthCellError, BirthRollFemale, BirthRollField, BirthRollValue } from './birthRollTypes';
import { useGridCellStyles } from './useGridCellStyles';

interface BirthRollGridRowProps {
  index: number;
  female: BirthRollFemale;
  value: BirthRollValue;
  errors: BirthCellError[];
  breeds: BirthBreedOption[];
  males: { id: number; identification: string }[];
  onChange: (change: Partial<BirthRollValue>) => void;
  onRemove?: () => void;
  allowOverdue: boolean;
}

/**
 * One pregnant female and what the round found. The calf cells open only for a live calving; a
 * calf born dead (NM) or dead at foot (M) asks at most its sex; the N alone asks only the day it was
 * seen. The date and the observations are asked whenever something is declared. A row left empty
 * is a female that did not calve yet.
 */
export const BirthRollGridRow: React.FC<BirthRollGridRowProps> = ({ index, female, value, errors, breeds, males, onChange, onRemove, allowOverdue }) => {
  const { theme, cellSx, inputSx, headerBg, zebraBg } = useGridCellStyles();
  const live = value.outcome === 'LIVE';
  const calved = value.outcome !== '';
  const resolved = calved || value.overdue;
  const hasError = (field: BirthRollField | 'mother') => errors.some((e) => e.field === field);
  const rowMessages = errors.map((e) => e.message);

  const text = (field: BirthRollField, props: { type?: string; placeholder?: string; align?: 'right'; enabled?: boolean }) => (
    <TextField
      fullWidth
      variant="outlined"
      type={props.type ?? 'text'}
      placeholder={props.placeholder}
      disabled={!(props.enabled ?? live)}
      error={hasError(field)}
      value={value[field]}
      onChange={(e) => onChange({ [field]: e.target.value } as Partial<BirthRollValue>)}
      sx={{ ...inputSx, ...(props.align === 'right' ? { '& input': { padding: '8px 10px', textAlign: 'right' } } : {}) }}
    />
  );

  return (
    <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
      <TableCell align="center" sx={{ ...cellSx, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.75rem', width: 40 }}>
        {index + 1}
      </TableCell>

      <TableCell sx={{ ...cellSx, ...(hasError('mother') ? { boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` } : {}) }}>
        <Box sx={{ px: 1.5, py: 0.75, minHeight: 40 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'primary.main' }}>{female.identification}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem', display: 'block' }}>
            {female.categoryLabel ?? 'Vientre'} · {stageLabel(female.stage)} · FPP {dueLabel(female.dueDate)}
          </Typography>
        </Box>
      </TableCell>

      <TableCell sx={cellSx}>
        <BirthOutcomeCell
          outcome={value.outcome}
          overdue={value.overdue}
          overdueReportedAt={female.overdueReportedAt}
          allowOverdue={allowOverdue}
          error={hasError('outcome')}
          sx={inputSx}
          onChange={onChange}
        />
      </TableCell>

      <TableCell sx={cellSx}>{text('calfIdentification', { placeholder: live ? 'Caravana cría' : '' })}</TableCell>

      <TableCell sx={cellSx}>
        <TextField
          select
          fullWidth
          variant="outlined"
          disabled={!calved}
          error={hasError('calfSex')}
          value={value.calfSex}
          onChange={(e) => onChange({ calfSex: e.target.value as 'M' | 'H' | '' })}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>—</em>
          </MenuItem>
          <MenuItem value="M">Macho</MenuItem>
          <MenuItem value="H">Hembra</MenuItem>
        </TextField>
      </TableCell>

      <TableCell sx={cellSx}>{text('calfWeight', { type: 'number', placeholder: live ? '0.0' : '', align: 'right' })}</TableCell>

      <BirthBreedCoatCells
        breedId={value.calfBreedId}
        colorId={value.calfColorId}
        breeds={breeds}
        disabled={!live}
        breedError={hasError('calfBreedId')}
        colorError={hasError('calfColorId')}
        cellSx={cellSx}
        inputSx={inputSx}
        onChange={onChange}
      />

      <TableCell sx={cellSx}>{text('calfTeeth', { type: 'number', align: 'right' })}</TableCell>

      <TableCell sx={cellSx}>
        <BirthSireCell
          sires={female.sires}
          males={males}
          value={value.fatherId}
          onChange={(fatherId) => onChange({ fatherId })}
          disabled={!live}
          error={hasError('fatherId')}
          sx={inputSx}
        />
      </TableCell>

      <TableCell sx={cellSx}>{text('birthDate', { type: 'date', enabled: resolved })}</TableCell>

      <TableCell sx={cellSx}>
        {text('observations', { placeholder: resolved ? (calved && !live ? 'Causa observada' : 'Observaciones') : '', enabled: resolved })}
      </TableCell>

      <TableCell align="center" sx={{ ...cellSx, borderRight: 0, width: 48 }}>
        {rowMessages.length > 0 ? (
          <Tooltip title={rowMessages.join(' ')}>
            <Box component="span" sx={{ color: 'error.main', display: 'inline-flex' }}>
              <FuseSvgIcon size={18}>heroicons-outline:exclamation-circle</FuseSvgIcon>
            </Box>
          </Tooltip>
        ) : onRemove ? (
          <Tooltip title="Quitar del registro">
            <IconButton size="small" onClick={onRemove} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
              <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        ) : null}
      </TableCell>
    </TableRow>
  );
};

export default BirthRollGridRow;

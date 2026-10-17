import React from 'react';
import { Box, MenuItem, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { dueLabel, stageLabel } from '../birthOrderFormat';
import BirthBreedCoatCells, { BirthBreedOption } from './BirthBreedCoatCells';
import BirthOutcomeCell from './BirthOutcomeCell';
import BirthSireCell from './BirthSireCell';
import type { BirthCellError, BirthRollFemale, BirthRollField, BirthRollValue } from './birthRollTypes';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';

interface BirthRollGridRowProps {
  index: number;
  female: BirthRollFemale;
  value: BirthRollValue;
  errors: BirthCellError[];
  breeds: BirthBreedOption[];
  males: { id: number; identification: string }[];
  onChange: (change: Partial<BirthRollValue>) => void;
  allowOverdue: boolean;
}

/**
 * One pregnant female and what the round found. The calf cells open only for a live calving; a
 * calf born dead (NM) or dead at foot (M) asks at most its sex; the N alone asks only the day it was
 * seen. The date and the observations are asked whenever something is declared. A row left empty
 * is a female that did not calve yet.
 */
export const BirthRollGridRow: React.FC<BirthRollGridRowProps> = ({ index, female, value, errors, breeds, males, onChange, allowOverdue }) => {
  const { cellSx, inputSx, indexSx, zebraBg } = useGridCellStyles();
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
      <TableCell align="center" sx={indexSx}>
        {index + 1}
      </TableCell>

      <SheetGridTagCell
        tag={female.identification}
        caption={`${female.categoryLabel ?? 'Vientre'} · ${stageLabel(female.stage)} · FPP ${dueLabel(female.dueDate)}`}
        error={hasError('mother')}
        adornment={
          female.openOrderCode && (
            <Tooltip title={`Está en la orden ${female.openOrderCode}: su parto se registra en esa orden.`}>
              <Box component="span" sx={{ color: 'info.main', display: 'inline-flex', cursor: 'help' }}>
                <FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>
              </Box>
            </Tooltip>
          )
        }
      />

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

      <SheetGridStatusCell error={rowMessages.length > 0 ? rowMessages.join(' ') : undefined} />
    </TableRow>
  );
};

export default BirthRollGridRow;

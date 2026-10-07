import React from 'react';
import { Box, Checkbox, IconButton, MenuItem, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGridCellStyles } from '@/ui/birth-orders/components/grid/useGridCellStyles';
import { ARRIVAL_FINDINGS, type ArrivalFindingCode } from '@/features/entry-orders/types';
import { breedPatchOf, troopChoicesOf } from './troopChoices';
import type { ReceptionRow, ReceptionRows, ReceptionTroopContext } from './useReceptionRows';

interface FullReceptionRowProps {
  row: ReceptionRow;
  index: number;
  draft: ReceptionRows;
  troop: ReceptionTroopContext;
}

type Choice = { fixed: string } | { options: { value: string | number; label: string }[] };

/** Moves the cursor to the caravan cell of another row, the way Enter does in a spreadsheet. */
const focusTagOf = (index: number) =>
  window.setTimeout(() => document.querySelector<HTMLInputElement>(`[data-full-reception-tag="${index}"]`)?.focus(), 0);

/**
 * One animal of the full-screen reception, a row of a spreadsheet like the PAR-01 review: its
 * caravan, sex, category, breed, coat, weight, body condition and the boxes of what it came off the
 * truck with. What the order fixes is shown grey and read-only; what it leaves open is chosen here.
 * The server's objections are drawn on the cell and told in the last column.
 */
export const FullReceptionRow: React.FC<FullReceptionRowProps> = ({ row, index, draft, troop }) => {
  const { theme, cellSx, inputSx, headerBg, zebraBg } = useGridCellStyles();
  const choices = troopChoicesOf(row, troop);
  const sent = draft.sentIndexOf(row.key);
  const errors = sent < 0 ? [] : draft.rowErrors.filter((e) => e.row === sent);
  const warning = sent < 0 ? undefined : draft.warnings.find((w) => w.row === sent);
  const marked = (field: string) => errors.some((e) => e.field === field);
  const outOfRange =
    row.weight !== '' && ((troop.minWeight != null && Number(row.weight) < troop.minWeight) || (troop.maxWeight != null && Number(row.weight) > troop.maxWeight));
  const update = (patch: Partial<ReceptionRow>) => draft.updateRow(row.key, patch);

  const choiceCell = (choice: Choice, value: string | number, field: string, onPick: (value: string) => void, empty: string) =>
    'fixed' in choice ? (
      <Tooltip title="Lo fija la orden: vale para todas las caravanas" disableInteractive>
        <TextField fullWidth variant="outlined" disabled value={choice.fixed} sx={inputSx} />
      </Tooltip>
    ) : (
      <TextField
        select
        fullWidth
        variant="outlined"
        value={value === '' ? '' : String(value)}
        error={marked(field)}
        onChange={(e) => onPick(e.target.value)}
        SelectProps={{ displayEmpty: true }}
        sx={inputSx}
      >
        <MenuItem value="">
          <em>{empty}</em>
        </MenuItem>
        {choice.options.map((option) => (
          <MenuItem key={option.value} value={String(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );

  const toggleFinding = (code: ArrivalFindingCode, checked: boolean) =>
    update({ arrival_findings: checked ? [...row.arrival_findings, code] : row.arrival_findings.filter((f) => f !== code) });

  const numberCell = (field: 'weight' | 'body_condition', props: { min?: number; max?: number; step?: number } = {}) => (
    <TextField
      fullWidth
      variant="outlined"
      type="number"
      value={row[field]}
      error={marked(field)}
      onChange={(e) => update({ [field]: e.target.value })}
      inputProps={props}
      sx={{ ...inputSx, ...(field === 'weight' && outOfRange ? { '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], boxShadow: `inset 0 0 0 2px ${theme.palette.warning.main}` } } : {}) }}
    />
  );

  return (
    <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
      <TableCell align="center" sx={{ ...cellSx, bgcolor: headerBg, color: 'text.disabled', fontSize: '0.72rem' }}>
        {index + 1}
      </TableCell>
      <TableCell sx={cellSx}>
        <TextField
          fullWidth
          variant="outlined"
          value={row.caravana}
          error={marked('caravana')}
          placeholder="N° de caravana"
          onChange={(e) => update({ caravana: e.target.value })}
          // A single-line input would drop the line breaks of a pasted list and glue the tags.
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');

            if (/[\s,;]/.test(text.trim())) {
              e.preventDefault();
              update({ caravana: `${row.caravana} ${text}` });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              focusTagOf(index + 1);
            }
          }}
          inputProps={{ 'data-full-reception-tag': index, style: { fontFamily: 'monospace', fontWeight: 700 } }}
          sx={inputSx}
        />
      </TableCell>
      <TableCell sx={cellSx}>{choiceCell(choices.sex, row.sex, 'sex', (value) => update({ sex: value as ReceptionRow['sex'] }), '—')}</TableCell>
      <TableCell sx={cellSx}>
        {choiceCell(choices.category, row.category_position, 'category_position', (value) => update({ category_position: value === '' ? '' : Number(value) }), 'Elegí')}
      </TableCell>
      <TableCell sx={cellSx}>
        {choiceCell(choices.breed, 'value' in choices.breed ? choices.breed.value : '', 'breed_position', (value) => update(breedPatchOf(troop, value)), 'Sin declarar')}
      </TableCell>
      <TableCell sx={cellSx}>
        {choiceCell(choices.coat, row.breed_position, 'breed_position', (value) => update({ breed_position: value === '' ? '' : Number(value) }), 'Elegí')}
      </TableCell>
      <TableCell sx={cellSx}>{numberCell('weight')}</TableCell>
      <TableCell sx={cellSx}>{numberCell('body_condition', { min: 1, max: 5, step: 0.5 })}</TableCell>
      {ARRIVAL_FINDINGS.map((finding) => (
        <TableCell key={finding.code} align="center" sx={cellSx}>
          <Checkbox
            size="small"
            checked={row.arrival_findings.includes(finding.code)}
            onChange={(e) => toggleFinding(finding.code, e.target.checked)}
            inputProps={{ 'aria-label': `Lesión ${finding.short}: ${row.caravana || `fila ${index + 1}`}` }}
          />
        </TableCell>
      ))}
      <TableCell align="center" sx={{ ...cellSx, borderRight: 0 }}>
        {errors.length > 0 || warning || outOfRange ? (
          <Tooltip title={errors.length > 0 ? errors.map((e) => e.message).join(' ') : (warning?.message ?? 'Peso fuera del rango de la compra')}>
            <Box component="span" sx={{ color: errors.length > 0 ? 'error.main' : 'warning.main', display: 'inline-flex' }}>
              <FuseSvgIcon size={18}>{errors.length > 0 ? 'heroicons-outline:exclamation-circle' : 'heroicons-outline:exclamation-triangle'}</FuseSvgIcon>
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="Quitar fila">
            <IconButton size="small" onClick={() => draft.removeRow(row.key)} sx={{ color: 'text.disabled', '&:hover': { color: theme.palette.error.main } }}>
              <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default FullReceptionRow;

import React from 'react';
import { Box, Checkbox, IconButton, MenuItem, TableCell, TableRow, TextField, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import BirthSireCell from '@/ui/birth-orders/components/grid/BirthSireCell';
import { useGridCellStyles } from '@/ui/birth-orders/components/grid/useGridCellStyles';
import { dueLabel } from '@/ui/birth-orders/components/birthOrderFormat';
import type { BirthOrderAnimal } from '@/features/birth-orders/types';
import type { Par01Row } from '../../hooks/usePar01Pages';
import ScanPar01BreedCell from './ScanPar01BreedCell';
import ScanPar01CoatCell from './ScanPar01CoatCell';
import type { Par01BreedOption } from './par01Catalog';
import ScanPar01OutcomeCell from './ScanPar01OutcomeCell';
import { par01RowStatus } from './par01RowStatus';

interface ScanPar01RowProps {
  index: number;
  row: Par01Row;
  animal: BirthOrderAnimal | null;
  /** The sheet names an order (a mother it does not list is "Fuera de la orden"). */
  hasOrder: boolean;
  errors: { code: string; message: string; field?: string }[];
  males: { id: number; identification: string }[];
  breeds: Par01BreedOption[];
  onChange: (field: keyof Par01Row, value: string) => void;
  onDelete: () => void;
}

const CAPTION_COLOR = { new: 'text.secondary', already: 'text.secondary', overdue_kept: 'warning.dark', differs: 'warning.main' } as const;

/**
 * One reviewed row. A female the order already resolved — or an overdue one still marked only with
 * N — is shown grey and read-only: a reloaded sheet skips her (R1). The rest is editable, with the
 * server's objections on the cell.
 */
export const ScanPar01Row: React.FC<ScanPar01RowProps> = ({ index, row, animal, hasOrder, errors, males, breeds, onChange, onDelete }) => {
  const { theme, cellSx, inputSx, headerBg, zebraBg } = useGridCellStyles();
  const status = par01RowStatus(row, animal);
  const readOnly = status.kind !== 'new';
  const outcome = status.mark.outcome;
  const live = outcome === 'LIVE';
  const marked = (field: string) => errors.some((e) => e.field === field);

  const cell = (field: keyof Par01Row, props: { type?: string; enabled?: boolean } = {}) => (
    <TextField
      fullWidth
      variant="outlined"
      type={props.type ?? 'text'}
      disabled={readOnly || props.enabled === false}
      error={marked(field)}
      value={row[field]}
      onChange={(e) => onChange(field, e.target.value)}
      sx={inputSx}
    />
  );

  const caption = status.message
    ? status.message
    : animal
      ? `FPP ${dueLabel(animal.estimated_due_date)}${animal.status === 'OVERDUE' ? ' · parto vencido' : ''}`
      : row.caravana_madre.trim() && hasOrder
        ? 'Fuera de la orden'
        : '';

  return (
    <TableRow
      sx={{
        '&:nth-of-type(even)': { bgcolor: zebraBg },
        ...(readOnly ? { bgcolor: `${alpha(theme.palette.text.primary, 0.04)} !important`, '& .MuiInputBase-root': { opacity: 0.75 } } : {})
      }}
    >
      <TableCell align="center" sx={{ ...cellSx, bgcolor: headerBg, color: 'text.disabled', fontSize: '0.72rem' }}>
        {index + 1}
      </TableCell>
      <TableCell sx={cellSx}>
        {cell('caravana_madre')}
        <Typography
          variant="caption"
          sx={{ px: 1.25, display: 'block', color: animal || !caption ? CAPTION_COLOR[status.kind] : 'warning.main', fontSize: '0.64rem', mt: -0.5, pb: 0.5, fontWeight: readOnly ? 700 : 400 }}
        >
          {caption}
        </Typography>
      </TableCell>
      <TableCell sx={cellSx}>
        <ScanPar01OutcomeCell value={row.resultado} error={marked('resultado')} disabled={readOnly} sx={inputSx} onChange={(value) => onChange('resultado', value)} />
      </TableCell>
      <TableCell sx={cellSx}>{cell('caravana_cria', { enabled: live || row.caravana_cria !== '' })}</TableCell>
      <TableCell sx={cellSx}>
        <TextField
          select
          fullWidth
          variant="outlined"
          disabled={readOnly}
          error={marked('sexo')}
          value={row.sexo}
          onChange={(e) => onChange('sexo', e.target.value)}
          SelectProps={{ displayEmpty: true }}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>—</em>
          </MenuItem>
          <MenuItem value="M">Macho</MenuItem>
          <MenuItem value="H">Hembra</MenuItem>
          {row.sexo && !['M', 'H'].includes(row.sexo) && <MenuItem value={row.sexo}>Leído: «{row.sexo}»</MenuItem>}
        </TextField>
      </TableCell>
      <TableCell sx={cellSx}>{cell('peso', { type: 'number' })}</TableCell>
      <TableCell sx={cellSx}>
        <ScanPar01BreedCell
          value={row.raza}
          breeds={breeds}
          error={marked('raza')}
          disabled={readOnly || (!live && row.raza === '')}
          sx={inputSx}
          onChange={(value) => onChange('raza', value)}
        />
      </TableCell>
      <TableCell sx={cellSx}>
        <ScanPar01CoatCell
          value={row.pelaje}
          breed={row.raza}
          breeds={breeds}
          error={marked('pelaje')}
          disabled={readOnly || (!live && row.pelaje === '')}
          sx={inputSx}
          onChange={(value) => onChange('pelaje', value)}
        />
      </TableCell>
      <TableCell sx={cellSx}>{cell('dientes', { type: 'number', enabled: live })}</TableCell>
      <TableCell sx={cellSx}>
        <BirthSireCell
          sires={animal?.sires ?? []}
          males={males}
          value={row.father_id === '' ? '' : Number(row.father_id)}
          onChange={(value) => onChange('father_id', value === '' ? '' : String(value))}
          disabled={readOnly || !live}
          error={marked('father_id')}
          sx={inputSx}
        />
      </TableCell>
      <TableCell sx={cellSx}>{cell('fecha_nacimiento', { type: 'date' })}</TableCell>
      <TableCell sx={cellSx}>{cell('observations')}</TableCell>
      <TableCell align="center" sx={{ ...cellSx, ...(marked('fuera_de_orden') ? { boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` } : {}) }}>
        <Checkbox
          size="small"
          disabled={readOnly}
          checked={row.fuera_de_orden !== ''}
          onChange={(e) => onChange('fuera_de_orden', e.target.checked ? 'X' : '')}
          inputProps={{ 'aria-label': `Fuera de orden: ${row.caravana_madre || 'fila ' + (index + 1)}` }}
        />
      </TableCell>
      <TableCell align="center" sx={{ ...cellSx, borderRight: 0 }}>
        {errors.length > 0 ? (
          <Tooltip title={errors.map((e) => e.message).join(' ')}>
            <Box component="span" sx={{ color: 'error.main', display: 'inline-flex' }}>
              <FuseSvgIcon size={18}>heroicons-outline:exclamation-circle</FuseSvgIcon>
            </Box>
          </Tooltip>
        ) : status.kind === 'differs' ? (
          <Tooltip title={status.message ?? ''}>
            <Box component="span" sx={{ color: 'warning.main', display: 'inline-flex' }}>
              <FuseSvgIcon size={18}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="Quitar fila">
            <IconButton size="small" onClick={onDelete} sx={{ color: 'text.disabled', '&:hover': { color: theme.palette.error.main } }}>
              <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ScanPar01Row;

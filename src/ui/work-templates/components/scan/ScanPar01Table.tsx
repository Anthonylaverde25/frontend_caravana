import React, { useMemo } from 'react';
import { Box, Checkbox, IconButton, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { BIRTH_OUTCOME_LABELS, BIRTH_OUTCOME_MARKS, BIRTH_OUTCOMES, birthOutcomeFromText } from '@/features/birth-orders/types';
import BirthSireCell from '@/ui/birth-orders/components/grid/BirthSireCell';
import { useGridCellStyles } from '@/ui/birth-orders/components/grid/useGridCellStyles';
import { dueLabel } from '@/ui/birth-orders/components/birthOrderFormat';
import type { Par01Row } from '../../hooks/usePar01Pages';
import type { Par01BirthOrderState } from '../../hooks/usePar01BirthOrder';
import type { Par01Problems } from '../../hooks/usePar01Submission';

interface ScanPar01TableProps {
  rows: Par01Row[];
  order: Par01BirthOrderState;
  problems: Par01Problems;
  onRowChange: (id: string, field: keyof Par01Row, value: string) => void;
  onDeleteRow: (id: string) => void;
}

const HEADERS: { label: string; minWidth: number }[] = [
  { label: 'Madre', minWidth: 170 },
  { label: 'Resultado', minWidth: 150 },
  { label: 'Caravana cría', minWidth: 130 },
  { label: 'Sexo', minWidth: 90 },
  { label: 'Peso', minWidth: 80 },
  { label: 'Raza', minWidth: 120 },
  { label: 'Dientes', minWidth: 70 },
  { label: 'Padre (no está en el papel)', minWidth: 190 },
  { label: 'Fecha nac.', minWidth: 140 },
  { label: 'Fuera de orden', minWidth: 90 }
];

/**
 * The supervised review of a PAR-01 load: every cell as read, editable, with the server's objections
 * marked on the cell itself. Two columns are not on the paper — the teeth (0) and the sire, offered
 * from the gestation of the female and optional. "Fuera de orden" is the box of the paper: a mother
 * the order did not list needs it crossed, here or there.
 */
export const ScanPar01Table: React.FC<ScanPar01TableProps> = ({ rows, order, problems, onRowChange, onDeleteRow }) => {
  const { theme, cellSx, inputSx, headerBg, zebraBg } = useGridCellStyles();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [] } = useCaravans(activeCompanyId);
  const males = useMemo(() => caravans.filter((c) => c.sex === 'M').map((c) => ({ id: c.id, identification: c.identification })), [caravans]);
  const head = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 1.25, py: 1, fontSize: '0.74rem' };

  return (
    <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
      <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth: 1500 }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...head, width: 40 }}>
              #
            </TableCell>
            {HEADERS.map((h) => (
              <TableCell key={h.label} sx={{ ...head, minWidth: h.minWidth }}>
                {h.label}
              </TableCell>
            ))}
            <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const errors = problems.byRowId[row.id] ?? [];
            const marked = (field: string) => errors.some((e) => e.field === field);
            const animal = order.animalOf(row.caravana_madre);
            const outcome = birthOutcomeFromText(row.resultado);
            const live = outcome === 'LIVE';
            const unknownOutcome = row.resultado.trim() !== '' && outcome === null;
            const cell = (field: keyof Par01Row, props: { type?: string; enabled?: boolean; server?: string } = {}) => (
              <TextField
                fullWidth
                variant="outlined"
                type={props.type ?? 'text'}
                disabled={props.enabled === false}
                error={marked(props.server ?? field)}
                value={row[field]}
                onChange={(e) => onRowChange(row.id, field, e.target.value)}
                sx={inputSx}
              />
            );

            return (
              <TableRow key={row.id} sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
                <TableCell align="center" sx={{ ...cellSx, bgcolor: headerBg, color: 'text.disabled', fontSize: '0.72rem' }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={cellSx}>
                  {cell('caravana_madre', { server: 'caravana_madre' })}
                  <Typography variant="caption" sx={{ px: 1.25, display: 'block', color: animal ? 'text.secondary' : 'warning.main', fontSize: '0.64rem', mt: -0.5, pb: 0.5 }}>
                    {animal
                      ? animal.status === 'PENDING'
                        ? `FPP ${dueLabel(animal.estimated_due_date)}`
                        : `Ya registrada: ${animal.outcome_label ?? animal.status}`
                      : row.caravana_madre.trim() && order.order
                        ? 'Fuera de la orden'
                        : ''}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    error={marked('resultado') || unknownOutcome}
                    value={outcome ? BIRTH_OUTCOME_MARKS[outcome] : row.resultado}
                    onChange={(e) => onRowChange(row.id, 'resultado', e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                    sx={inputSx}
                  >
                    <MenuItem value="">
                      <em>Sin marcar (pendiente)</em>
                    </MenuItem>
                    {BIRTH_OUTCOMES.map((o) => (
                      <MenuItem key={o} value={BIRTH_OUTCOME_MARKS[o]}>
                        {BIRTH_OUTCOME_MARKS[o]} · {BIRTH_OUTCOME_LABELS[o]}
                      </MenuItem>
                    ))}
                    {unknownOutcome && <MenuItem value={row.resultado}>Leído: «{row.resultado}»</MenuItem>}
                  </TextField>
                </TableCell>
                <TableCell sx={cellSx}>{cell('caravana_cria', { enabled: live || row.caravana_cria !== '' })}</TableCell>
                <TableCell sx={cellSx}>
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    error={marked('sexo')}
                    value={row.sexo}
                    onChange={(e) => onRowChange(row.id, 'sexo', e.target.value)}
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
                <TableCell sx={cellSx}>{cell('raza')}</TableCell>
                <TableCell sx={cellSx}>{cell('dientes', { type: 'number', enabled: live })}</TableCell>
                <TableCell sx={cellSx}>
                  <BirthSireCell
                    sires={animal?.sires ?? []}
                    males={males}
                    value={row.father_id === '' ? '' : Number(row.father_id)}
                    onChange={(value) => onRowChange(row.id, 'father_id', value === '' ? '' : String(value))}
                    disabled={!live}
                    error={marked('father_id')}
                    sx={inputSx}
                  />
                </TableCell>
                <TableCell sx={cellSx}>{cell('fecha_nacimiento', { type: 'date' })}</TableCell>
                <TableCell align="center" sx={{ ...cellSx, ...(marked('fuera_de_orden') ? { boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` } : {}) }}>
                  <Checkbox
                    size="small"
                    checked={row.fuera_de_orden !== ''}
                    onChange={(e) => onRowChange(row.id, 'fuera_de_orden', e.target.checked ? 'X' : '')}
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
                  ) : (
                    <Tooltip title="Quitar fila">
                      <IconButton size="small" onClick={() => onDeleteRow(row.id)} sx={{ color: 'text.disabled', '&:hover': { color: theme.palette.error.main } }}>
                        <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScanPar01Table;

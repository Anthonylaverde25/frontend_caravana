import React from 'react';
import { Checkbox, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ING03_FINDING_FIELDS, type Ing03Row } from '../../../hooks/useIng03Pages';
import type { Ing03Layout } from '../../../templates/ing03/ing03Columns';
import type { Ing03Outcome, Ing03RowResolution } from './ing03Resolution';

export const OUTCOME_CHIP: Record<Ing03Outcome, { label: string; color: 'success' | 'default' | 'error' }> = {
  received: { label: 'Se recibe', color: 'success' },
  ignored: { label: 'No se carga', color: 'default' },
  error: { label: 'A corregir', color: 'error' }
};

type EditableField = 'caravana' | 'sexo' | 'cat' | 'raza' | 'pelaje' | 'ec' | 'peso' | 'ojo' | 'oreja' | 'aplomo';

const FINDING_LABELS: Record<(typeof ING03_FINDING_FIELDS)[number][0], string> = { ojo: 'Ojo', oreja: 'Oreja', aplomo: 'Aplomo' };

interface Ing03ReviewTableProps {
  rows: Ing03Row[];
  resolutions: Map<string, Ing03RowResolution>;
  /** Columns the order leaves to each animal and how the sheet asked for them, as the paper prints them. */
  layout: Ing03Layout;
  locked: boolean;
  onChange: (id: string, field: EditableField, value: string) => void;
  onDelete: (id: string) => void;
}

/**
 * The lines of a scanned ING-03, editable: one animal that arrived per line, its caravan as read
 * and, when the order leaves them to each animal, its sex, category and breed — a number and a
 * letter on a sheet by code, words (and the coat) on a sheet in words; then EC, weight and the
 * boxes of what it came off the truck with. Each line says what it will do and why; a written
 * breed or category the server could not resolve offers its candidates, one click each.
 */
export const Ing03ReviewTable: React.FC<Ing03ReviewTableProps> = ({ rows, resolutions, layout, locked, onChange, onDelete }) => {
  const { mixed, needsCategory, severalBreeds, averaged, written } = layout;
  const textField = (field: EditableField) => field === 'ec' || field === 'peso' || (written && (field === 'raza' || field === 'pelaje' || field === 'cat'));

  const cell = (row: Ing03Row, field: EditableField, width: number) => (
    <TextField
      size="small"
      variant="standard"
      value={row[field]}
      disabled={locked}
      onChange={(e) => onChange(row.id, field, textField(field) ? e.target.value : e.target.value.toUpperCase())}
      InputProps={{ disableUnderline: true, sx: { fontFamily: 'monospace', fontWeight: field === 'caravana' ? 800 : 600, fontSize: '0.8rem' } }}
      sx={{ width }}
    />
  );

  /** A candidate replaces what was written; a full "Breed Coat" label also clears the coat cell. */
  const pick = (row: Ing03Row, field: 'raza' | 'pelaje' | 'cat', candidate: string) => {
    onChange(row.id, field, candidate.toUpperCase());

    if (field === 'raza' && candidate.includes(' ')) onChange(row.id, 'pelaje', '');
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'text.secondary' } }}>
            <TableCell>Hoja</TableCell>
            <TableCell>Caravana</TableCell>
            {mixed && <TableCell>Sexo</TableCell>}
            {needsCategory && <TableCell>{written ? 'Categoría' : 'Cat.'}</TableCell>}
            {severalBreeds && <TableCell>Raza</TableCell>}
            {severalBreeds && written && <TableCell>Pelaje</TableCell>}
            <TableCell>EC</TableCell>
            {!averaged && <TableCell>Peso</TableCell>}
            {ING03_FINDING_FIELDS.map(([field]) => (
              <TableCell key={field} sx={{ px: 0.25, textAlign: 'center' }}>
                {FINDING_LABELS[field]}
              </TableCell>
            ))}
            <TableCell>Resultado</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const result = resolutions.get(row.id);
            const outcome = result?.outcome ?? 'ignored';

            return (
              <TableRow key={row.id} data-scan-row-id={row.id} sx={{ bgcolor: outcome === 'error' ? 'rgba(220, 38, 38, 0.05)' : undefined }}>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{row.pageNumber ?? '—'}</TableCell>
                <TableCell>{cell(row, 'caravana', 160)}</TableCell>
                {mixed && <TableCell>{cell(row, 'sexo', 36)}</TableCell>}
                {needsCategory && <TableCell>{cell(row, 'cat', written ? 110 : 36)}</TableCell>}
                {severalBreeds && <TableCell>{cell(row, 'raza', written ? 110 : 36)}</TableCell>}
                {severalBreeds && written && <TableCell>{cell(row, 'pelaje', 90)}</TableCell>}
                <TableCell>{cell(row, 'ec', 44)}</TableCell>
                {!averaged && <TableCell>{cell(row, 'peso', 70)}</TableCell>}
                {ING03_FINDING_FIELDS.map(([field]) => (
                  <TableCell key={field} sx={{ px: 0.25, textAlign: 'center' }}>
                    <Checkbox
                      size="small"
                      checked={row[field] !== ''}
                      disabled={locked}
                      onChange={(e) => onChange(row.id, field, e.target.checked ? 'X' : '')}
                      inputProps={{ 'aria-label': `Lesión ${FINDING_LABELS[field]}` }}
                      sx={{ p: 0.25 }}
                    />
                  </TableCell>
                ))}
                <TableCell sx={{ minWidth: 220 }}>
                  <Chip size="small" label={OUTCOME_CHIP[outcome].label} color={OUTCOME_CHIP[outcome].color} sx={{ fontWeight: 700, mb: result?.note ? 0.5 : 0 }} />
                  {result?.note && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', lineHeight: 1.3, color: result.note.severity === 'error' ? 'error.main' : result.note.severity === 'warning' ? 'warning.dark' : 'text.secondary' }}
                    >
                      {result.note.message}
                    </Typography>
                  )}
                  {result?.fix && !locked && (
                    <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {result.fix.candidates.map((candidate) => (
                        <Chip
                          key={candidate}
                          size="small"
                          variant="outlined"
                          color="primary"
                          label={candidate}
                          onClick={() => pick(row, result.fix!.field, candidate)}
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      ))}
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Quitar renglón">
                    <span>
                      <IconButton size="small" disabled={locked} onClick={() => onDelete(row.id)}>
                        <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Ing03ReviewTable;

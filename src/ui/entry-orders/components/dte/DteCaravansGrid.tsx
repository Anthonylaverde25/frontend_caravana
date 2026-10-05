import React from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ChoiceButtons from './ChoiceButtons';
import type { DteDraft, DteRow, DteTroopContext } from './useDteDraft';

interface DteCaravansGridProps {
  draft: DteDraft;
  troop: DteTroopContext;
}

const headSx = { py: 0.75, px: 1, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.3px' } as const;
const cellSx = { py: 0.25, px: 0.5, borderBottomColor: 'divider' } as const;

/**
 * Moves the cursor to the caravan cell of another row, the way Enter does in a spreadsheet. The
 * next row is always there (the grid ends with a blank one), so it moves at once; only a row being
 * created waits for the render.
 */
const focusTagOf = (index: number) => {
  const next = document.querySelector<HTMLInputElement>(`[data-dte-tag="${index}"]`);

  if (next) next.focus();
  else window.setTimeout(() => document.querySelector<HTMLInputElement>(`[data-dte-tag="${index}"]`)?.focus(), 0);
};

/**
 * One row per caravan of the DTE, typed cell by cell or pasted: a list pasted into a cell spreads
 * over as many rows. The last row is always blank, ready for the next caravan. Sex and breed
 * columns only exist when the order needs them per caravan (a troop of both sexes, several
 * breeds); the weight only when the animals arrive with the DTE ("Registrar ingreso"). A cell the
 * server rejected is marked red with its reason; a warning is marked amber and does not block.
 */
export const DteCaravansGrid: React.FC<DteCaravansGridProps> = ({ draft, troop }) => {
  const theme = useTheme();
  const severalBreeds = troop.breeds.length > 1;

  const problemOf = (row: DteRow, field: string) => {
    const index = draft.sentIndexOf(row.key);

    return index < 0 ? undefined : draft.rowErrors.find((e) => e.row === index && e.field === field);
  };
  const warningOf = (row: DteRow) => {
    const index = draft.sentIndexOf(row.key);

    return index < 0 ? undefined : draft.warnings.find((w) => w.row === index);
  };

  const outOfRange = (weight: string) => {
    if (weight === '') return false;
    const value = Number(weight);

    return (troop.minWeight != null && value < troop.minWeight) || (troop.maxWeight != null && value > troop.maxWeight);
  };

  const inputSx = (error: boolean, warn = false) => ({
    width: '100%',
    px: 1,
    py: 0.25,
    fontSize: '0.85rem',
    borderRadius: '4px',
    border: '1px solid',
    borderColor: error ? 'error.main' : warn ? 'warning.main' : 'transparent',
    '&:hover': { bgcolor: 'action.hover' },
    '&.Mui-focused': { bgcolor: 'action.hover', borderColor: error ? 'error.main' : 'primary.main' }
  });

  return (
    <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: '6px' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headSx, width: 40 }}>#</TableCell>
            <TableCell sx={headSx}>Caravana</TableCell>
            {troop.isMixed && <TableCell sx={{ ...headSx, width: 96 }}>Sexo</TableCell>}
            {severalBreeds && <TableCell sx={{ ...headSx, width: 40 + troop.breeds.length * 34 }}>Raza</TableCell>}
            {troop.withArrival && <TableCell sx={{ ...headSx, width: 110 }}>Peso (kg)</TableCell>}
            <TableCell sx={{ ...headSx, width: 40 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {draft.rows.map((row, index) => {
            const isNew = index === draft.rows.length - 1 && row.caravana === '';
            const tagError = problemOf(row, 'caravana');
            const sexError = problemOf(row, 'sex');
            const breedError = problemOf(row, 'breed_position');
            const weightError = problemOf(row, 'weight');
            const warning = warningOf(row);
            const message =
              (tagError ?? sexError ?? breedError ?? weightError)?.message ??
              (warning?.code === 'BREED_UNDECLARED' ? 'Queda sin raza declarada' : undefined) ??
              (troop.withArrival && outOfRange(row.weight) ? 'Peso fuera del rango de la compra' : undefined);
            const hasError = Boolean(tagError || sexError || breedError || weightError);

            return (
              <TableRow
                key={row.key}
                sx={{ bgcolor: hasError ? alpha(theme.palette.error.main, 0.05) : warning ? alpha(theme.palette.warning.main, 0.06) : undefined }}
              >
                <TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.75rem', fontWeight: 600 }}>{isNew ? '+' : index + 1}</TableCell>
                <TableCell sx={cellSx}>
                  <InputBase
                    value={row.caravana}
                    placeholder={isNew ? 'Escribí o pegá caravanas…' : 'N° de caravana'}
                    onChange={(e) => draft.updateRow(row.key, { caravana: e.target.value })}
                    // A single-line input would drop the line breaks of a pasted list and glue the tags.
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');

                      if (/[\s,;]/.test(text.trim())) {
                        e.preventDefault();
                        draft.updateRow(row.key, { caravana: `${row.caravana} ${text}` });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        focusTagOf(index + 1);
                      }
                    }}
                    inputProps={{ 'data-dte-tag': index, style: { fontFamily: 'monospace', fontWeight: 700 } }}
                    sx={inputSx(Boolean(tagError))}
                  />
                  {message && (
                    <Typography variant="caption" sx={{ display: 'block', px: 1, color: hasError ? 'error.main' : 'warning.main', lineHeight: 1.3 }}>
                      {message}
                    </Typography>
                  )}
                </TableCell>
                {troop.isMixed && (
                  <TableCell sx={cellSx}>
                    {!isNew && (
                      <ChoiceButtons
                        value={row.sex}
                        error={Boolean(sexError)}
                        options={[
                          { value: 'M', label: 'M', title: 'Macho' },
                          { value: 'H', label: 'H', title: 'Hembra' }
                        ]}
                        onChange={(value) => draft.updateRow(row.key, { sex: value as DteRow['sex'] })}
                      />
                    )}
                  </TableCell>
                )}
                {severalBreeds && (
                  <TableCell sx={cellSx}>
                    {!isNew && (
                      <ChoiceButtons
                        value={row.breed_position === '' ? '' : String(row.breed_position)}
                        error={Boolean(breedError)}
                        warn={warning?.code === 'BREED_UNDECLARED'}
                        options={troop.breeds.map((breed) => ({ value: String(breed.position), label: breed.letter, title: breed.label }))}
                        onChange={(value) => draft.updateRow(row.key, { breed_position: value === '' ? '' : Number(value) })}
                      />
                    )}
                  </TableCell>
                )}
                {troop.withArrival && (
                  <TableCell sx={cellSx}>
                    {!isNew && (
                      <InputBase
                        type="number"
                        value={row.weight}
                        placeholder="—"
                        onChange={(e) => draft.updateRow(row.key, { weight: e.target.value })}
                        sx={inputSx(Boolean(weightError), outOfRange(row.weight))}
                      />
                    )}
                  </TableCell>
                )}
                <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
                  {!isNew && (
                    <Tooltip title="Quitar">
                      <IconButton size="small" onClick={() => draft.removeRow(row.key)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                        <FuseSvgIcon size={15}>heroicons-outline:x-mark</FuseSvgIcon>
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Box sx={{ px: 1.5, py: 0.75, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary">
          Enter pasa a la fila siguiente. Pegar la lista del DTE en una celda la reparte en filas
          {troop.isMixed ? '. Para el sexo, escribí o pegá la caravana seguida de M o H ("0331 H")' : ''}.
        </Typography>
      </Box>
    </TableContainer>
  );
};

export default DteCaravansGrid;

import React from 'react';
import {
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { DteDraft, DteTroopContext } from './useDteDraft';

interface DteCaravansGridProps {
  draft: DteDraft;
  troop: DteTroopContext;
}

const cellSx = { py: 0.5, px: 1 } as const;

/**
 * One row per caravan of the DTE. Sex and breed columns only exist when the order needs them per
 * caravan (a troop of both sexes, several breeds); otherwise every caravan inherits them. A cell
 * the server rejected is marked red with its reason; a warning (weight out of the declared range)
 * is marked amber and does not block.
 */
export const DteCaravansGrid: React.FC<DteCaravansGridProps> = ({ draft, troop }) => {
  const theme = useTheme();
  const severalBreeds = troop.breeds.length > 1;

  const problemOf = (index: number, field: string) => draft.rowErrors.find((e) => e.row === index && e.field === field);
  const warningOf = (index: number) => draft.warnings.find((w) => w.row === index);

  const rowBg = (index: number) =>
    draft.rowErrors.some((e) => e.row === index)
      ? alpha(theme.palette.error.main, 0.06)
      : warningOf(index)
        ? alpha(theme.palette.warning.main, 0.08)
        : undefined;

  const outOfRange = (weight: string) => {
    if (weight === '') return false;
    const value = Number(weight);

    return (troop.minWeight != null && value < troop.minWeight) || (troop.maxWeight != null && value > troop.maxWeight);
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...cellSx, width: 48, fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Caravana</TableCell>
              {troop.isMixed && <TableCell sx={{ ...cellSx, width: 220, fontWeight: 700 }}>Sexo</TableCell>}
              {severalBreeds && <TableCell sx={{ ...cellSx, width: 220, fontWeight: 700 }}>Raza</TableCell>}
              <TableCell sx={{ ...cellSx, width: 130, fontWeight: 700 }}>Peso (kg)</TableCell>
              <TableCell sx={{ ...cellSx, width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {draft.rows.map((row, index) => {
              const tagError = problemOf(index, 'caravana');
              const sexError = problemOf(index, 'sex');
              const breedError = problemOf(index, 'breed_position');
              const weightError = problemOf(index, 'weight');
              const warning = warningOf(index);

              return (
                <TableRow key={row.key} sx={{ bgcolor: rowBg(index) }}>
                  <TableCell sx={{ ...cellSx, color: 'text.secondary', fontWeight: 600 }}>{index + 1}</TableCell>
                  <TableCell sx={cellSx}>
                    <TextField
                      size="small"
                      fullWidth
                      value={row.caravana}
                      placeholder="N° de caravana"
                      onChange={(e) => draft.updateRow(row.key, { caravana: e.target.value })}
                      error={!!tagError}
                      helperText={tagError?.message}
                      inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
                    />
                  </TableCell>
                  {troop.isMixed && (
                    <TableCell sx={cellSx}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={row.sex}
                        onChange={(e) => draft.updateRow(row.key, { sex: e.target.value as 'M' | 'H' })}
                        error={!!sexError}
                        helperText={sexError?.message}
                      >
                        <MenuItem value="M">Macho</MenuItem>
                        <MenuItem value="H">Hembra</MenuItem>
                      </TextField>
                    </TableCell>
                  )}
                  {severalBreeds && (
                    <TableCell sx={cellSx}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={row.breed_position}
                        onChange={(e) => draft.updateRow(row.key, { breed_position: e.target.value === '' ? '' : Number(e.target.value) })}
                        error={!!breedError}
                        helperText={breedError?.message ?? (warning?.code === 'BREED_UNDECLARED' ? 'Queda sin raza' : undefined)}
                      >
                        <MenuItem value="">
                          <em>Sin declarar</em>
                        </MenuItem>
                        {troop.breeds.map((breed) => (
                          <MenuItem key={breed.position} value={breed.position}>
                            {breed.letter} · {breed.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  )}
                  <TableCell sx={cellSx}>
                    <TextField
                      size="small"
                      type="number"
                      fullWidth
                      value={row.weight}
                      onChange={(e) => draft.updateRow(row.key, { weight: e.target.value })}
                      error={!!weightError}
                      helperText={weightError?.message ?? (outOfRange(row.weight) ? 'Fuera del rango de la compra' : undefined)}
                      FormHelperTextProps={{ sx: { color: weightError ? undefined : 'warning.main' } }}
                      sx={
                        !weightError && outOfRange(row.weight)
                          ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'warning.main' } }
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Tooltip title="Quitar fila">
                      <IconButton size="small" onClick={() => draft.removeRow(row.key)}>
                        <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DteCaravansGrid;

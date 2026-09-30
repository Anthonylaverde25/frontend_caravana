import React from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import ScanCact01Totals from './ScanCact01Totals';
import ScanCact01CategoryCell, { systemFilledInputSx } from './ScanCact01CategoryCell';
import type { Cact01Destination, Cact01Error, Cact01Metadata, Cact01Row } from './types';

const SEX_FROM_TAG_HINT = 'Sexo del animal según su caravana. El de la planilla es sólo ilustrativo.';
const SEX_UNKNOWN_HINT = 'Se completa cuando la caravana identifica a un animal del sistema.';

interface ScanCact01TableProps {
  rows: Cact01Row[];
  metadata: Cact01Metadata;
  destinations: Cact01Destination[];
  pageLabelByKey: Record<string, string>;
  onRowChange: (id: string, field: keyof Cact01Row, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow?: () => void;
  rowErrorsById?: Record<string, Cact01Error[]>;
  editedRowIds?: Set<string>;
  onlyWithErrors?: boolean;
}

const cellSx = (hasErrors: boolean) => ({ borderBottom: hasErrors ? 'none' : undefined });

const COLUMN_COUNT = 11;

/**
 * The management system a row's destination already has, when it has one: the M cell then
 * has nothing left to say and is shown fixed instead of offered for review.
 *
 * - An existing batch that declares it: the batch wins, the paper never reconfigures it.
 * - A batch to be created when the header box is marked: the box is the proposal for every
 *   batch of the sheet, so the cell of each row only repeats it.
 *
 * Null when it is still unknown — an existing batch without it, or a new one with the header
 * blank — which is the only case where the letter written on the row decides something.
 */
const knownManagement = (
  destination: Cact01Destination | undefined,
  headerMarked: boolean
): { letter: 'C' | 'P'; source: string } | null => {
  if (!destination || destination.isConfined == null) return null;

  const letter = destination.isConfined ? 'C' : 'P';

  if (destination.mode === 'existing' && destination.batchId != null) {
    return { letter, source: 'del lote' };
  }

  if (destination.mode === 'new' && headerMarked) {
    return { letter, source: 'encabezado' };
  }

  return null;
};

/**
 * Editable table of the animals read on every CACT-01 page.
 *
 * The sex is the animal's, known by its tag: the sheet prints it only to be read in the field,
 * so the cell shows the system's and is not editable. The category is editable but advisory:
 * a difference with the system comes back as a warning rather than an overwrite. The weight and the
 * dentition are the measurements of the day. The C/S nueva cell is the one way the sheet
 * changes a category, and only when its order said the category changes.
 */
export const ScanCact01Table: React.FC<ScanCact01TableProps> = ({
  rows,
  metadata,
  destinations,
  pageLabelByKey,
  onRowChange,
  onDeleteRow,
  onAddRow,
  rowErrorsById = {},
  editedRowIds = new Set(),
  onlyWithErrors = false,
}) => {
  const headerMarked = metadata.sistema_manejo === 'CORRAL' || metadata.sistema_manejo === 'PASTURA';
  const destinationByKey = new Map(destinations.map((destination) => [destination.key, destination]));

  const visible = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !onlyWithErrors || rowErrorsById[row.id]);

  return (
    <Box>
      <ScanCact01Totals rows={rows} metadata={metadata} />

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1280, '& .MuiTableCell-root': { borderColor: 'divider' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56, fontWeight: 800 }}>Hoja</TableCell>
              <TableCell sx={{ width: 56, fontWeight: 800 }}>Fila</TableCell>
              <TableCell sx={{ width: 170, fontWeight: 800 }}>Caravana</TableCell>
              <TableCell sx={{ width: 110, fontWeight: 800 }}>Peso (kg)</TableCell>
              <TableCell sx={{ width: 80, fontWeight: 800 }}>Sexo</TableCell>
              <TableCell sx={{ width: 140, fontWeight: 800 }}>Categoría</TableCell>
              <TableCell sx={{ width: 110, fontWeight: 800 }}>Dentición</TableCell>
              <TableCell sx={{ width: 190, fontWeight: 800 }}>Lote destino</TableCell>
              <TableCell sx={{ width: 96, fontWeight: 800 }}>
                <Tooltip title="Sistema de manejo del lote destino: C corral, P pastura">
                  <span>M</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ width: 200, fontWeight: 800 }}>
                <Tooltip title="Categoría o subcategoría nueva, como se escribió en la manga. Vacía = no cambia.">
                  <span>C/S nueva</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Observaciones</TableCell>
              <TableCell sx={{ width: 56 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT + 1}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    {onlyWithErrors ? 'No quedan filas con errores.' : 'Sin animales cargados.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visible.map(({ row, index }) => {
              const errors = rowErrorsById[row.id] ?? [];
              const edited = editedRowIds.has(row.id);
              const hasErrors = errors.length > 0;

              return (
                <React.Fragment key={row.id}>
                  <TableRow sx={{ bgcolor: hasErrors && !edited ? (t) => alpha(t.palette.error.main, 0.06) : undefined }}>
                    <TableCell sx={{ ...cellSx(hasErrors), fontWeight: 700, color: 'text.secondary' }}>
                      {pageLabelByKey[row.pageKey] ?? '—'}
                    </TableCell>
                    <TableCell sx={{ ...cellSx(hasErrors), fontWeight: 700, color: 'text.secondary' }}>{index + 1}</TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.caravana}
                        onChange={(e) => onRowChange(row.id, 'caravana', e.target.value)}
                        size="small"
                        fullWidth
                        error={hasErrors && !edited}
                        InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.peso_actual}
                        onChange={(e) => onRowChange(row.id, 'peso_actual', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="—"
                        inputProps={{ inputMode: 'decimal' }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <Tooltip title={row.systemFilled?.sexo ? SEX_FROM_TAG_HINT : SEX_UNKNOWN_HINT}>
                        <TextField
                          value={row.sexo}
                          size="small"
                          fullWidth
                          placeholder="—"
                          sx={row.systemFilled?.sexo ? systemFilledInputSx : undefined}
                          InputProps={{ readOnly: true }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <ScanCact01CategoryCell
                        value={row.categoria}
                        onChange={(value) => onRowChange(row.id, 'categoria', value)}
                        sex={row.sexo}
                        errors={[]}
                        edited={false}
                        placeholder="—"
                        fromSystem={row.systemFilled?.categoria === true}
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.dientes}
                        onChange={(e) => onRowChange(row.id, 'dientes', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        select
                        value={destinations.some((d) => d.key === row.destination_key) ? row.destination_key : ''}
                        onChange={(e) => onRowChange(row.id, 'destination_key', e.target.value)}
                        size="small"
                        fullWidth
                        // An animal without a destination is set here, in its own cell: there is
                        // no sheet-wide destination to fall back on.
                        error={row.destination_key === ''}
                        helperText={row.destination_key === '' ? 'Definí el destino de este animal' : undefined}
                        SelectProps={{ displayEmpty: true }}
                      >
                        <MenuItem value="">(sin destino)</MenuItem>
                        {destinations
                          .filter((destination) => destination.key !== '')
                          .map((destination) => (
                            <MenuItem key={destination.key} value={destination.key}>
                              {destination.mode === 'new' ? `${destination.name} (nuevo)` : destination.name}
                            </MenuItem>
                          ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      {/* The letter of the destination BATCH, not of the animal. Fixed when the
                          destination already has it; editable only while it is unknown, because
                          a one-letter handwritten cell is the likeliest thing on the sheet for
                          the OCR to miss. */}
                      {(() => {
                        const known = knownManagement(destinationByKey.get(row.destination_key), headerMarked);

                        if (known) {
                          return (
                            <Tooltip
                              title={
                                known.source === 'del lote'
                                  ? 'El lote destino ya tiene declarado su sistema de manejo. La celda del papel no lo cambia.'
                                  : 'Lote nuevo: toma el sistema de manejo marcado en el encabezado.'
                              }
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 800, color: 'text.secondary', whiteSpace: 'nowrap', px: 0.5 }}
                              >
                                {known.letter}
                                <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                                  · {known.source}
                                </Typography>
                              </Typography>
                            </Tooltip>
                          );
                        }

                        return (
                          <TextField
                            select
                            value={row.manejo === 'C' || row.manejo === 'P' ? row.manejo : ''}
                            onChange={(e) => onRowChange(row.id, 'manejo', e.target.value)}
                            size="small"
                            fullWidth
                          >
                            <MenuItem value="">—</MenuItem>
                            <MenuItem value="C">C · corral</MenuItem>
                            <MenuItem value="P">P · pastura</MenuItem>
                          </TextField>
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <ScanCact01CategoryCell
                        value={row.cs_nueva}
                        onChange={(value) => onRowChange(row.id, 'cs_nueva', value)}
                        sex={row.sexo}
                        errors={errors}
                        edited={edited}
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.observations}
                        onChange={(e) => onRowChange(row.id, 'observations', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <Tooltip title="Quitar fila">
                        <IconButton size="small" onClick={() => onDeleteRow(row.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  {hasErrors && (
                    <TableRow sx={{ bgcolor: !edited ? (t) => alpha(t.palette.error.main, 0.06) : undefined }}>
                      <TableCell colSpan={2} />
                      <TableCell colSpan={COLUMN_COUNT - 1} sx={{ pt: 0 }}>
                        {errors.map((error) => (
                          <Box key={error.code} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <ErrorOutlineIcon sx={{ fontSize: 16, color: edited ? 'text.disabled' : 'error.main' }} />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: edited ? 'text.disabled' : 'error.main', textDecoration: edited ? 'line-through' : 'none' }}
                            >
                              {error.message}
                            </Typography>
                          </Box>
                        ))}
                        {edited && (
                          <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 700 }}>
                            Fila editada: se vuelve a validar al reintentar la carga.
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {onAddRow && (
        <Button startIcon={<AddIcon />} onClick={onAddRow} size="small" sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}>
          Agregar animal
        </Button>
      )}
    </Box>
  );
};

export default ScanCact01Table;

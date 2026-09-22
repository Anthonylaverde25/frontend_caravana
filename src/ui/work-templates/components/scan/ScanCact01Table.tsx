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
import type { Cact01Destination, Cact01Error, Cact01Metadata, Cact01Row } from './types';

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

const COLUMN_COUNT = 9;

/**
 * Editable table of the animals read on every CACT-01 page.
 *
 * Sex and category are editable but advisory: they identify the animal, and a difference
 * with the system comes back as a warning rather than an overwrite. The weight and the
 * dentition are the measurements of the day, and the only two columns the sheet writes.
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
  const visible = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !onlyWithErrors || rowErrorsById[row.id]);

  return (
    <Box>
      <ScanCact01Totals rows={rows} metadata={metadata} />

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1080, '& .MuiTableCell-root': { borderColor: 'divider' } }}>
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
                      <TextField
                        value={row.sexo}
                        onChange={(e) => onRowChange(row.id, 'sexo', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.categoria}
                        onChange={(e) => onRowChange(row.id, 'categoria', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="—"
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

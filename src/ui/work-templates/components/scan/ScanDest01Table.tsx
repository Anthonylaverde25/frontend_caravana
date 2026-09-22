import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
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
import { Dest01Error, Dest01Row } from './types';

interface ScanDest01TableProps {
  rows: Dest01Row[];
  pageLabelByKey: Record<string, string>;
  onRowChange: (id: string, field: keyof Dest01Row, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow?: () => void;
  rowErrorsById?: Record<string, Dest01Error[]>;
  editedRowIds?: Set<string>;
  onlyWithErrors?: boolean;
}

const cellSx = (hasErrors: boolean) => ({ borderBottom: hasErrors ? 'none' : undefined });

/** Editable table of the calves read on every DEST-01 page, with live totals and the problems of each row. */
export const ScanDest01Table: React.FC<ScanDest01TableProps> = ({
  rows,
  pageLabelByKey,
  onRowChange,
  onDeleteRow,
  onAddRow,
  rowErrorsById = {},
  editedRowIds = new Set(),
  onlyWithErrors = false,
}) => {
  const totals = useMemo(() => {
    const calves = rows.filter((r) => r.caravana.trim() !== '');
    const weights = calves.map((r) => Number(r.peso.replace(',', '.'))).filter((w) => isPositiveWeight(w));
    return {
      calves: calves.length,
      weighed: weights.length,
      average: weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : null,
    };
  }, [rows]);

  const visible = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !onlyWithErrors || rowErrorsById[row.id]);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
        <Chip size="small" color="primary" variant="outlined" label={`Crías: ${totals.calves}`} sx={{ fontWeight: 800, borderRadius: '4px' }} />
        <Chip size="small" variant="outlined" label={`Pesadas: ${totals.weighed}`} sx={{ fontWeight: 700, borderRadius: '4px' }} />
        <Chip
          size="small"
          variant="outlined"
          label={`Peso promedio: ${totals.average !== null ? `${totals.average.toFixed(1)} kg` : '—'}`}
          sx={{ fontWeight: 700, borderRadius: '4px' }}
        />
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 760, '& .MuiTableCell-root': { borderColor: 'divider' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56, fontWeight: 800 }}>Hoja</TableCell>
              <TableCell sx={{ width: 56, fontWeight: 800 }}>Fila</TableCell>
              <TableCell sx={{ width: 190, fontWeight: 800 }}>Caravana de la Cría</TableCell>
              <TableCell sx={{ width: 190, fontWeight: 800 }}>Caravana de la Madre</TableCell>
              <TableCell sx={{ width: 120, fontWeight: 800 }}>Peso (kg)</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Observaciones</TableCell>
              <TableCell sx={{ width: 56 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    {onlyWithErrors ? 'No quedan filas con errores.' : 'Sin crías cargadas.'}
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
                        value={row.caravana_madre}
                        onChange={(e) => onRowChange(row.id, 'caravana_madre', e.target.value)}
                        size="small"
                        fullWidth
                        InputProps={{ sx: { fontFamily: 'monospace' } }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.peso}
                        onChange={(e) => onRowChange(row.id, 'peso', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="—"
                        inputProps={{ inputMode: 'decimal' }}
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
                      <TableCell colSpan={5} sx={{ pt: 0 }}>
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
          Agregar cría
        </Button>
      )}
    </Box>
  );
};

function isPositiveWeight(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export default ScanDest01Table;

import React from 'react';
import {
  Box,
  Button,
  IconButton,
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
import { Lser01Error, WorkTemplateScanRow } from './types';

interface ScanLser01TableProps {
  rows: WorkTemplateScanRow[];
  onRowChange: (index: number, field: keyof WorkTemplateScanRow, value: any) => void;
  onDeleteRow: (index: number) => void;
  onAddRow?: () => void;
  /** Row errors keyed by row id; when set, only rows with errors are listed unless `showAll`. */
  rowErrorsById?: Record<string, Lser01Error[]>;
  editedRowIds?: Set<string>;
  onlyWithErrors?: boolean;
  rowKey: (row: WorkTemplateScanRow, index: number) => string;
}

/** Editable table of the females written on an LSER-01 sheet, with the problems of each row. */
export const ScanLser01Table: React.FC<ScanLser01TableProps> = ({
  rows,
  onRowChange,
  onDeleteRow,
  onAddRow,
  rowErrorsById = {},
  editedRowIds = new Set(),
  onlyWithErrors = false,
  rowKey,
}) => {
  const visible = rows
    .map((row, index) => ({ row, index, key: rowKey(row, index) }))
    .filter(({ key }) => !onlyWithErrors || rowErrorsById[key]);

  return (
    <Box>
      <Table size="small" sx={{ '& .MuiTableCell-root': { borderColor: 'divider' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 56, fontWeight: 800 }}>Fila</TableCell>
            <TableCell sx={{ width: 220, fontWeight: 800 }}>Caravana del Vientre</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Observaciones</TableCell>
            <TableCell sx={{ width: 56 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  {onlyWithErrors ? 'No quedan filas con errores.' : 'Sin vientres cargados.'}
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {visible.map(({ row, index, key }) => {
            const errors = rowErrorsById[key] ?? [];
            const edited = editedRowIds.has(key);
            const hasErrors = errors.length > 0;

            return (
              <React.Fragment key={key}>
                <TableRow sx={{ bgcolor: hasErrors && !edited ? (t) => alpha(t.palette.error.main, 0.06) : undefined }}>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: hasErrors ? 'none' : undefined }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ borderBottom: hasErrors ? 'none' : undefined }}>
                    <TextField
                      value={row.caravana}
                      onChange={(e) => onRowChange(index, 'caravana', e.target.value)}
                      size="small"
                      fullWidth
                      error={hasErrors && !edited}
                      InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: hasErrors ? 'none' : undefined }}>
                    <TextField
                      value={row.observations ?? ''}
                      onChange={(e) => onRowChange(index, 'observations', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: hasErrors ? 'none' : undefined }}>
                    <Tooltip title="Quitar fila">
                      <IconButton size="small" onClick={() => onDeleteRow(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                {hasErrors && (
                  <TableRow sx={{ bgcolor: !edited ? (t) => alpha(t.palette.error.main, 0.06) : undefined }}>
                    <TableCell />
                    <TableCell colSpan={3} sx={{ pt: 0 }}>
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

      {onAddRow && (
        <Button startIcon={<AddIcon />} onClick={onAddRow} size="small" sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}>
          Agregar vientre
        </Button>
      )}
    </Box>
  );
};

export default ScanLser01Table;

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
import type { Theme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { labelOfPair } from '@/features/categories/categoryLabels';
import { Dest01Error, Dest01Row } from './types';
import { parseWeight, reviewWeightIssues } from '../../utils/weightOutliers';
import { ScanDest01RowProblems } from './ScanDest01RowProblems';

interface ScanDest01TableProps {
  rows: Dest01Row[];
  pageLabelByKey: Record<string, string>;
  onRowChange: (id: string, field: keyof Dest01Row, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow?: () => void;
  rowErrorsById?: Record<string, Dest01Error[]>;
  editedRowIds?: Set<string>;
  onlyWithErrors?: boolean;
  /** Each calf has its own weaning batch: the Lote destino and M columns. */
  perAnimal?: boolean;
  /** The category may change: the C/S nueva column (blank = no change). */
  showCategory?: boolean;
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
  perAnimal = false,
  showCategory = true,
}) => {
  const columnCount = 8 + (showCategory ? 1 : 0) + (perAnimal ? 2 : 0);

  // The C/S each calf has now, known by its tag: the reference for the C/S nueva, never read off paper.
  const { data: births = [] } = useBirthHistory();
  const { categories } = useAnimalCategories();
  const currentCategoryByTag = useMemo(
    () =>
      new Map(
        births.map((b) => [
          b.calf_identification.trim().toUpperCase(),
          labelOfPair(categories, b.calf_category_id, b.calf_subcategory_id) ?? 'Sin categoría'
        ])
      ),
    [births, categories]
  );
  const totals = useMemo(() => {
    const calves = rows.filter((r) => r.caravana.trim() !== '');
    const weights = calves.map((r) => parseWeight(r.peso)).filter((w): w is number => w !== null && w > 0);
    return {
      calves: calves.length,
      weighed: weights.length,
      average: weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : null,
    };
  }, [rows]);

  // Zero is never a weight; a weight far from the troop may be a typo. Both are shown here,
  // on the row, while the sheet is still being reviewed.
  const weightIssues = useMemo(() => reviewWeightIssues(rows), [rows]);

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
        <Table size="small" sx={{ minWidth: perAnimal ? 1100 : 860, '& .MuiTableCell-root': { borderColor: 'divider' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56, fontWeight: 800 }}>Hoja</TableCell>
              <TableCell sx={{ width: 56, fontWeight: 800 }}>Fila</TableCell>
              <TableCell sx={{ width: 190, fontWeight: 800 }}>Caravana de la Cría</TableCell>
              <TableCell sx={{ width: 190, fontWeight: 800 }}>Caravana de la Madre</TableCell>
              <TableCell sx={{ width: 140, fontWeight: 800 }}>
                <Tooltip title="La del sistema, según la caravana de la cría. No se lee de la planilla.">
                  <span>C/S actual</span>
                </Tooltip>
              </TableCell>
              {showCategory && <TableCell sx={{ width: 170, fontWeight: 800 }}>C/S nueva</TableCell>}
              <TableCell sx={{ width: 110, fontWeight: 800 }}>Peso (kg)</TableCell>
              {perAnimal && <TableCell sx={{ width: 190, fontWeight: 800 }}>Lote destino</TableCell>}
              {perAnimal && <TableCell sx={{ width: 60, fontWeight: 800 }}>M</TableCell>}
              <TableCell sx={{ fontWeight: 800 }}>Observaciones</TableCell>
              <TableCell sx={{ width: 56 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    {onlyWithErrors ? 'No quedan filas con errores.' : 'Sin crías cargadas.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visible.map(({ row, index }) => {
              const errors = rowErrorsById[row.id] ?? [];
              const edited = editedRowIds.has(row.id);
              const weightIssue = weightIssues[row.id];
              const hasServerErrors = errors.length > 0;
              const hasErrors = hasServerErrors || weightIssue !== undefined;
              // Red for what blocks the load, amber for what only asks to be looked at again.
              const rowTint = (t: Theme) =>
                hasServerErrors || weightIssue?.severity === 'error'
                  ? alpha(t.palette.error.main, 0.06)
                  : alpha(t.palette.warning.main, 0.08);

              return (
                <React.Fragment key={row.id}>
                  <TableRow sx={{ bgcolor: (hasServerErrors && !edited) || weightIssue ? rowTint : undefined }}>
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
                        error={hasServerErrors && !edited}
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
                      {(() => {
                        const tag = row.caravana.trim().toUpperCase();
                        const current = tag ? currentCategoryByTag.get(tag) : undefined;

                        return (
                          <Typography
                            variant="body2"
                            color={current ? 'text.primary' : 'text.disabled'}
                            sx={{ fontWeight: current ? 600 : 400, fontStyle: current ? 'normal' : 'italic' }}
                          >
                            {current ?? (tag ? 'No es una cría' : '—')}
                          </Typography>
                        );
                      })()}
                    </TableCell>
                    {showCategory && (
                      <TableCell sx={cellSx(hasErrors)}>
                        <TextField
                          value={row.cs_nueva}
                          onChange={(e) => onRowChange(row.id, 'cs_nueva', e.target.value)}
                          size="small"
                          fullWidth
                          placeholder="No cambia"
                        />
                      </TableCell>
                    )}
                    <TableCell sx={cellSx(hasErrors)}>
                      <TextField
                        value={row.peso}
                        onChange={(e) => onRowChange(row.id, 'peso', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="—"
                        inputProps={{ inputMode: 'decimal' }}
                        error={weightIssue?.severity === 'error'}
                        sx={
                          weightIssue?.severity === 'warning'
                            ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'warning.main', borderWidth: 2 } }
                            : undefined
                        }
                      />
                    </TableCell>
                    {perAnimal && (
                      <TableCell sx={cellSx(hasErrors)}>
                        <TextField
                          value={row.lote_destino}
                          onChange={(e) => onRowChange(row.id, 'lote_destino', e.target.value)}
                          size="small"
                          fullWidth
                          // A calf without its batch is completed on its row, never from the header.
                          error={row.caravana.trim() !== '' && row.lote_destino.trim() === ''}
                          placeholder="Sin lote"
                        />
                      </TableCell>
                    )}
                    {perAnimal && (
                      <TableCell sx={cellSx(hasErrors)}>
                        <TextField
                          value={row.manejo}
                          onChange={(e) => onRowChange(row.id, 'manejo', e.target.value.toUpperCase().slice(0, 1))}
                          size="small"
                          inputProps={{ maxLength: 1, style: { textAlign: 'center', fontWeight: 800 } }}
                        />
                      </TableCell>
                    )}
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
                    <TableRow sx={{ bgcolor: !edited || weightIssue ? rowTint : undefined }}>
                      <TableCell colSpan={2} />
                      <TableCell colSpan={columnCount - 2} sx={{ pt: 0 }}>
                        <ScanDest01RowProblems errors={errors} weightIssue={weightIssue} edited={edited} />
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

export default ScanDest01Table;

import { KeyboardEvent, useRef } from 'react';
import { Stack, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';
import type { WeighingTypeCode } from '@/core/weighing/domain/entities/Weighing';
import { weighingWarnings } from '@/core/weighing/domain/services/weighingSanity';
import { categoryKey } from './batchWeighingFormModel';

interface CategoryAveragesSheetProps {
  categories: BatchCategoryCount[];
  loading: boolean;
  averages: Record<string, string>;
  rowErrors?: Record<string, string>;
  type: WeighingTypeCode;
  date: string;
  onChange: (key: string, value: string) => void;
}

const kg = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/**
 * One row per category of the batch: where it stands and its new average. A batch of one category
 * has one row, and a category left empty keeps the weights of its animals, because the average of
 * the cows says nothing true about a calf.
 */
export function CategoryAveragesSheet({ categories, loading, averages, rowErrors = {}, type, date, onChange }: CategoryAveragesSheetProps) {
  const { cellSx, headSx, indexSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
  const sheetRef = useRef<HTMLDivElement>(null);

  const moveDown = (event: KeyboardEvent, row: number) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    sheetRef.current?.querySelector<HTMLInputElement>(`[data-average-row="${row + 1}"]`)?.focus();
  };

  const filled = categories
    .map((c) => ({ heads: c.count, average: Number(averages[categoryKey(c)]) }))
    .filter((c) => c.average > 0);
  const heads = filled.reduce((sum, c) => sum + c.heads, 0);
  const mass = filled.reduce((sum, c) => sum + c.heads * c.average, 0);
  const totalHeads = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div ref={sheetRef}>
      <SheetGrid minWidth={760}>
        <TableHead>
          <TableRow>
            <TableCell sx={indexSx}>#</TableCell>
            <TableCell sx={headSx}>Categoría</TableCell>
            <TableCell sx={{ ...headSx, width: 90 }} align="right">Cabezas</TableCell>
            <TableCell sx={{ ...headSx, width: 90 }} align="right">Pesadas</TableCell>
            <TableCell sx={{ ...headSx, width: 160 }} align="right">Promedio actual (kg)</TableCell>
            <TableCell sx={{ ...headSx, width: 150 }} align="right">Nuevo promedio (kg)</TableCell>
            <TableCell sx={{ ...headSx, width: 110 }} align="right">Masa (kg)</TableCell>
            <TableCell sx={{ ...headSx, width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.length === 0 && (
            <SheetGridEmptyRow colSpan={8}>{loading ? 'Cargando la composición del lote…' : 'El lote no tiene animales para pesar.'}</SheetGridEmptyRow>
          )}
          {categories.map((category, index) => {
            const key = categoryKey(category);
            const value = averages[key] ?? '';
            const average = Number(value);
            const error = rowErrors[key];

            return (
              <TableRow key={key}>
                <TableCell sx={indexSx}>{index + 1}</TableCell>
                <TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{category.name ?? 'Sin categoría'}</TableCell>
                <TableCell sx={textCellSx} align="right">{category.count}</TableCell>
                <TableCell sx={{ ...textCellSx, color: 'text.secondary' }} align="right">{category.weighed_count}</TableCell>
                <TableCell sx={{ ...textCellSx, color: category.average_weight === null ? 'text.disabled' : 'text.primary' }} align="right">
                  {category.average_weight === null ? 'Sin peso' : kg(category.average_weight)}
                </TableCell>
                <TableCell sx={{ ...cellSx, ...(error ? errorRing : {}) }}>
                  <TextField
                    autoFocus={index === 0}
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={value}
                    placeholder="Sin cambios"
                    onChange={(e) => onChange(key, e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
                    onKeyDown={(e) => moveDown(e, index)}
                    inputProps={{
                      inputMode: 'decimal',
                      'aria-label': `Nuevo promedio de ${category.name ?? 'sin categoría'}`,
                      'data-average-row': index,
                      style: { textAlign: 'right', fontWeight: 700 },
                    }}
                    sx={inputSx}
                  />
                </TableCell>
                <TableCell sx={{ ...textCellSx, color: 'text.secondary' }} align="right">
                  {average > 0 ? kg(average * category.count) : '—'}
                </TableCell>
                <SheetGridStatusCell error={error} warning={average > 0 ? weighingWarnings(average, date, type)[0] : undefined} />
              </TableRow>
            );
          })}
        </TableBody>
      </SheetGrid>

      <Stack direction="row" justifyContent="flex-end" spacing={3} sx={{ mt: 1.5, fontSize: '0.85rem' }}>
        <Typography sx={{ fontSize: 'inherit' }}>Se actualizan: <b>{heads} de {totalHeads} cab.</b></Typography>
        <Typography sx={{ fontSize: 'inherit' }}>Masa: <b>{kg(mass)} kg</b></Typography>
      </Stack>
    </div>
  );
}

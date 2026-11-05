import { KeyboardEvent, useRef } from 'react';
import { Button, IconButton, MenuItem, TableBody, TableCell, TableFooter, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';
import { CageGroupsSummary, groupAverage } from '@/core/weighing/domain/services/cageGroups';
import { CageGroupRow, categoryKey, emptyGroup, rowCategoryKey, toGroupInput } from './batchWeighingFormModel';

interface CageGroupsSheetProps {
  groups: CageGroupRow[];
  categories: BatchCategoryCount[];
  rowErrors?: Record<number, string>;
  withTare: boolean;
  summary: CageGroupsSummary;
  onChange: (groups: CageGroupRow[]) => void;
}

type Field = 'headCount' | 'gross' | 'tare';

const kg = (value: number | null) => (value === null ? '—' : value.toLocaleString('es-AR', { maximumFractionDigits: 1 }));

/**
 * The loads of the scale as a spreadsheet: one row per cage, Enter moves down the column and
 * adds a row at the end, and the footer keeps the running totals. Each cage declares its category;
 * a new one starts with the category of the last, since cages of a category usually go in a row.
 */
export function CageGroupsSheet({ groups, categories, rowErrors = {}, withTare, summary, onChange }: CageGroupsSheetProps) {
  const { cellSx, headSx, indexSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
  const sheetRef = useRef<HTMLDivElement>(null);
  const fields: Field[] = withTare ? ['headCount', 'gross', 'tare'] : ['headCount', 'gross'];
  const mixed = categories.length > 1;
  const loadedCategories = new Set(groups.map((g) => rowCategoryKey(g, categories)).filter(Boolean));
  const addRow = () => onChange([...groups, emptyGroup(groups[groups.length - 1]?.categoryKey)]);

  // After the render that may have added the row.
  const focusCell = (row: number, column: number) =>
    setTimeout(() => sheetRef.current?.querySelector<HTMLInputElement>(`[data-sheet-cell="${row}:${column}"]`)?.focus(), 0);

  const update = (key: number, field: Field | 'categoryKey', value: string) =>
    onChange(groups.map((g) => (g.key === key ? { ...g, [field]: value } : g)));

  const handleKeyDown = (event: KeyboardEvent, row: number, column: number) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    if (row === groups.length - 1) {
      addRow();
    }
    focusCell(row + 1, column);
  };

  return (
    <div ref={sheetRef}>
      <SheetGrid minWidth={720}>
        <TableHead>
          <TableRow>
            <TableCell sx={indexSx}>Jaula</TableCell>
            <TableCell sx={headSx}>Categoría</TableCell>
            <TableCell sx={{ ...headSx, width: 110 }} align="right">Cabezas</TableCell>
            <TableCell sx={{ ...headSx, width: 130 }} align="right">{withTare ? 'Bruto (kg)' : 'Kg'}</TableCell>
            {withTare && <TableCell sx={{ ...headSx, width: 110 }} align="right">Tara (kg)</TableCell>}
            <TableCell sx={{ ...headSx, width: 110 }} align="right">Kg / cab</TableCell>
            <TableCell sx={{ ...headSx, width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((row, index) => (
            <TableRow key={row.key}>
              <TableCell sx={indexSx}>{index + 1}</TableCell>
              <TableCell sx={{ ...cellSx, ...(rowErrors[row.key] && !row.categoryKey && mixed ? errorRing : {}) }}>
                {mixed ? (
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={row.categoryKey}
                    onChange={(e) => update(row.key, 'categoryKey', e.target.value)}
                    SelectProps={{ displayEmpty: true }}
                    inputProps={{ 'aria-label': `Categoría jaula ${index + 1}` }}
                    sx={inputSx}
                  >
                    <MenuItem value="" disabled>
                      Elegir categoría
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={categoryKey(category)} value={categoryKey(category)}>
                        {category.name ?? 'Sin categoría'}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Tooltip title="El lote tiene una sola categoría" disableInteractive>
                    <TextField fullWidth variant="outlined" size="small" disabled value={categories[0]?.name ?? 'Sin categoría'} sx={inputSx} />
                  </Tooltip>
                )}
              </TableCell>
              {fields.map((field, column) => (
                <TableCell key={field} sx={{ ...cellSx, ...(rowErrors[row.key] && rowCategoryKey(row, categories) ? errorRing : {}) }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={row[field]}
                    onChange={(e) => update(row.key, field, e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
                    onKeyDown={(e) => handleKeyDown(e, index, column)}
                    onFocus={(e) => e.target.select()}
                    inputProps={{
                      inputMode: 'decimal',
                      'aria-label': `${field} jaula ${index + 1}`,
                      'data-sheet-cell': `${index}:${column}`,
                      style: { textAlign: 'right' },
                    }}
                    sx={inputSx}
                  />
                </TableCell>
              ))}
              <TableCell sx={{ ...textCellSx, color: 'text.secondary' }} align="right">
                {kg(groupAverage(toGroupInput(row, categories)))}
              </TableCell>
              <SheetGridStatusCell error={rowErrors[row.key]} keepChildren>
                <Tooltip title="Quitar jaula">
                  <span>
                    <IconButton size="small" onClick={() => onChange(groups.filter((g) => g.key !== row.key))} disabled={groups.length === 1}>
                      <FuseSvgIcon size={15}>heroicons-outline:trash</FuseSvgIcon>
                    </IconButton>
                  </span>
                </Tooltip>
              </SheetGridStatusCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell sx={indexSx}>Total</TableCell>
            <TableCell sx={headSx} />
            <TableCell sx={{ ...headSx, color: 'text.primary' }} align="right">{summary.heads}</TableCell>
            <TableCell sx={{ ...headSx, color: 'text.primary' }} align="right" colSpan={withTare ? 2 : 1}>{kg(summary.netWeight)}</TableCell>
            {/* Across categories a single average would be the very figure this sheet avoids. */}
            <TableCell sx={{ ...headSx, color: 'text.primary' }} align="right">{kg(loadedCategories.size > 1 ? null : summary.average)}</TableCell>
            <TableCell sx={headSx} />
          </TableRow>
        </TableFooter>
      </SheetGrid>
      {Object.values(rowErrors).map((message) => (
        <Typography key={message} variant="caption" color="error" component="div" sx={{ mt: 0.5 }}>
          {message}
        </Typography>
      ))}
      <Button
        size="small"
        onClick={() => {
          addRow();
          focusCell(groups.length, 0);
        }}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
        sx={{
          mt: 1.5,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
          borderRadius: '6px',
          px: 1.5,
          py: 0.5,
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }}
      >
        Agregar jaula
      </Button>
    </div>
  );
}

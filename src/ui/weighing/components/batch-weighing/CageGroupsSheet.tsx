import { KeyboardEvent, useRef } from 'react';
import { Button, IconButton, Table, TableBody, TableCell, TableFooter, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CageGroupsSummary, groupAverage } from '@/core/weighing/domain/services/cageGroups';
import { CageSheetCell } from './CageSheetCell';
import { CageGroupRow, emptyGroup, toGroupInput } from './batchWeighingFormModel';
import { sheetCellSx, sheetHeadSx, sheetIndexSx } from './sheetStyles';

interface CageGroupsSheetProps {
  groups: CageGroupRow[];
  rowErrors?: Record<number, string>;
  withTare: boolean;
  summary: CageGroupsSummary;
  onChange: (groups: CageGroupRow[]) => void;
}

type Field = 'headCount' | 'gross' | 'tare';

const kg = (value: number | null) => (value === null ? '—' : value.toLocaleString('es-AR', { maximumFractionDigits: 1 }));

/**
 * The loads of the scale as a spreadsheet: one row per cage, Enter moves down the column and
 * adds a row at the end, and the footer keeps the running totals.
 */
export function CageGroupsSheet({ groups, rowErrors = {}, withTare, summary, onChange }: CageGroupsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const fields: Field[] = withTare ? ['headCount', 'gross', 'tare'] : ['headCount', 'gross'];

  // After the render that may have added the row.
  const focusCell = (row: number, column: number) =>
    setTimeout(() => sheetRef.current?.querySelector<HTMLInputElement>(`[data-sheet-cell="${row}:${column}"]`)?.focus(), 0);

  const update = (key: number, field: Field, value: string) =>
    onChange(groups.map((g) => (g.key === key ? { ...g, [field]: value } : g)));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, row: number, column: number) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    if (row === groups.length - 1) {
      onChange([...groups, emptyGroup()]);
    }
    focusCell(row + 1, column);
  };

  return (
    <div ref={sheetRef}>
      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={sheetIndexSx}>Jaula</TableCell>
            <TableCell align="right" sx={sheetHeadSx}>Cabezas</TableCell>
            <TableCell align="right" sx={sheetHeadSx}>{withTare ? 'Bruto (kg)' : 'Kg'}</TableCell>
            {withTare && <TableCell align="right" sx={sheetHeadSx}>Tara (kg)</TableCell>}
            <TableCell align="right" sx={sheetHeadSx}>Kg / cab</TableCell>
            <TableCell sx={(t) => ({ ...sheetHeadSx(t), width: 40 })} />
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((row, index) => (
            <TableRow key={row.key}>
              <TableCell sx={sheetIndexSx}>{index + 1}</TableCell>
              {fields.map((field, column) => (
                <CageSheetCell
                  key={field}
                  value={row[field]}
                  row={index}
                  column={column}
                  label={`${field} jaula ${index + 1}`}
                  error={!!rowErrors[row.key]}
                  onChange={(value) => update(row.key, field, value)}
                  onKeyDown={handleKeyDown}
                />
              ))}
              <TableCell align="right" sx={(t) => ({ ...sheetCellSx(t), px: 1.25, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' })}>
                {kg(groupAverage(toGroupInput(row)))}
              </TableCell>
              <TableCell align="center" sx={sheetCellSx}>
                <Tooltip title="Quitar jaula">
                  <span>
                    <IconButton size="small" onClick={() => onChange(groups.filter((g) => g.key !== row.key))} disabled={groups.length === 1}>
                      <FuseSvgIcon size={15}>heroicons-outline:trash</FuseSvgIcon>
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell sx={sheetIndexSx}>Total</TableCell>
            <TableCell align="right" sx={(t) => ({ ...sheetHeadSx(t), color: 'text.primary' })}>{summary.heads}</TableCell>
            <TableCell align="right" sx={(t) => ({ ...sheetHeadSx(t), color: 'text.primary' })} colSpan={withTare ? 2 : 1}>
              {kg(summary.netWeight)}
            </TableCell>
            <TableCell align="right" sx={(t) => ({ ...sheetHeadSx(t), color: 'text.primary' })}>{kg(summary.average)}</TableCell>
            <TableCell sx={sheetHeadSx} />
          </TableRow>
        </TableFooter>
      </Table>
      {Object.values(rowErrors).map((message) => (
        <Typography key={message} variant="caption" color="error" component="div" sx={{ mt: 0.5 }}>
          {message}
        </Typography>
      ))}
      <Button
        size="small"
        onClick={() => {
          onChange([...groups, emptyGroup()]);
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

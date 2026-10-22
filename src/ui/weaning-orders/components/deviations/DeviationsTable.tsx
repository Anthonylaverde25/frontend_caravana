import React from 'react';
import { Box, Button, Checkbox, Chip, Stack, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { TRANSFER_ORDER_STATUS_LABELS } from '@/features/transfer-orders/types';
import { DeviationOrderGroup, DeviationRow, formatDay } from './deviationRows';

interface DeviationsTableProps {
  groups: DeviationOrderGroup[];
  selected: Set<string>;
  onToggle: (row: DeviationRow) => void;
  onToggleGroup: (group: DeviationOrderGroup) => void;
  onOpenOrder: (orderId: number) => void;
}

const smallSx = { display: 'block', fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.3 } as const;

/**
 * The deviations, by order: what was planned and what was done, when and by whom, and whether
 * somebody reviewed it. Only what is not reviewed yet can be chosen.
 */
export const DeviationsTable: React.FC<DeviationsTableProps> = ({ groups, selected, onToggle, onToggleGroup, onOpenOrder }) => {
  const { headSx, indexSx, textCellSx, groupBg, selectedBg, zebraBg } = useGridCellStyles();
  const wrapSx = { ...textCellSx, height: 'auto', py: 0.75, whiteSpace: 'normal' } as const;

  return (
    <SheetGrid minWidth={1100} maxHeight="calc(100vh - 360px)">
      <TableHead>
        <TableRow>
          <TableCell sx={indexSx} />
          <TableCell sx={{ ...headSx, width: 200 }}>Cría</TableCell>
          <TableCell sx={{ ...headSx, width: 140 }}>Desvío</TableCell>
          <TableCell sx={headSx}>Planificado</TableCell>
          <TableCell sx={headSx}>Ejecutado</TableCell>
          <TableCell sx={{ ...headSx, width: 130 }}>Cuándo · quién</TableCell>
          <TableCell sx={{ ...headSx, width: 260 }}>Revisión</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {groups.map((group) => {
          const open = group.rows.filter((r) => !r.reviewed);
          const chosen = open.filter((r) => selected.has(r.key)).length;

          return (
            <React.Fragment key={group.orderId}>
              <TableRow>
                <TableCell sx={{ ...indexSx, bgcolor: groupBg }}>
                  <Checkbox
                    size="small"
                    checked={open.length > 0 && chosen === open.length}
                    indeterminate={chosen > 0 && chosen < open.length}
                    disabled={open.length === 0}
                    onChange={() => onToggleGroup(group)}
                    inputProps={{ 'aria-label': `Elegir los desvíos de ${group.code}` }}
                    sx={{ p: 0.5 }}
                  />
                </TableCell>
                <TableCell colSpan={6} sx={{ ...textCellSx, bgcolor: groupBg }}>
                  <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: 'primary.main' }}>{group.code}</Typography>
                    {group.status && (
                      <Chip size="small" variant="outlined" color="info" label={TRANSFER_ORDER_STATUS_LABELS[group.status]} sx={{ height: 22, fontWeight: 700 }} />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {group.rows.length} desvío(s) · {group.pending} sin revisar
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button size="small" onClick={() => onOpenOrder(group.orderId)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Abrir orden →
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>

              {group.rows.map((row, index) => {
                const isSelected = selected.has(row.key);

                return (
                  <TableRow
                    key={row.key}
                    hover
                    onClick={() => !row.reviewed && onToggle(row)}
                    sx={{ cursor: row.reviewed ? 'default' : 'pointer', bgcolor: isSelected ? selectedBg : index % 2 === 1 ? zebraBg : 'inherit' }}
                  >
                    <TableCell sx={indexSx}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        disabled={row.reviewed}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => onToggle(row)}
                        inputProps={{ 'aria-label': `Elegir el desvío de ${row.title}` }}
                        sx={{ p: 0.5 }}
                      />
                    </TableCell>
                    <TableCell sx={wrapSx}>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'primary.main' }}>{row.title}</Typography>
                      <Typography component="span" sx={smallSx}>
                        {row.caption}
                      </Typography>
                    </TableCell>
                    <TableCell sx={textCellSx}>
                      <Chip size="small" variant="outlined" label={row.kindLabel} sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ ...wrapSx, color: 'text.secondary' }}>{row.planned ?? '—'}</TableCell>
                    <TableCell sx={{ ...wrapSx, fontWeight: 700 }}>{row.actual ?? '—'}</TableCell>
                    <TableCell sx={wrapSx}>
                      {formatDay(row.occurredAt)}
                      <Typography component="span" sx={smallSx}>
                        {row.recordedBy ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={wrapSx}>
                      <Chip
                        size="small"
                        color={row.reviewed ? 'success' : 'warning'}
                        variant={row.reviewed ? 'filled' : 'outlined'}
                        label={row.reviewed ? 'Revisado' : 'Sin revisar'}
                        sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      {row.reviewed && (
                        <Typography component="span" sx={{ ...smallSx, fontStyle: 'italic', mt: 0.25 }}>
                          «{row.reviewNote}» · {row.reviewedBy ?? '—'}, {formatDay(row.reviewedAt)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          );
        })}
      </TableBody>
    </SheetGrid>
  );
};

export default DeviationsTable;

import { useState, type ComponentProps } from 'react';
import { alpha, Box, LinearProgress, Link, TableCell, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import WorkCardActions from '../../service-order-work-card/WorkCardActions';
import FemalesVerdictDialog from '../../service-order-work-card/FemalesVerdictDialog';
import { getTrayDeadline, trayCardId, trayTimeLabel } from '../../../utils/diagnosisTray';
import { formatDay } from '../../../utils/reproductiveVerdict';
import type { TrayOrderHandlers } from './DiagnosisTrayTable';

interface TrayTableRowProps extends TrayOrderHandlers {
  order: ServiceOrder;
  batchName: string;
  caravans: ComponentProps<typeof FemalesVerdictDialog>['caravans'];
  zebra: boolean;
  highlighted: boolean;
}

const monoSx = { fontFamily: 'monospace' } as const;
const EMPTY = '—';

/** One open order as a table row: identification, window, diagnosis in one column per figure, actions. */
export default function TrayTableRow({ order, batchName, caravans, zebra, highlighted, ...handlers }: TrayTableRowProps) {
  const { cellSx, zebraBg } = useGridCellStyles();
  const [femalesOpen, setFemalesOpen] = useState(false);

  const summary = order.diagnosis_summary;
  const total = summary?.total ?? order.female_caravan_ids.length;
  const provisional = summary?.provisional_empty ?? 0;
  const scanned = (summary?.evaluated ?? 0) + provisional;
  const progress = total > 0 ? Math.round((scanned / total) * 100) : 0;
  const untouched = scanned === 0 || !summary;
  const rate = summary?.partial_rate;

  const deadline = getTrayDeadline(order);
  const urgent = deadline === 'OVERDUE' || deadline === 'CLOSING_SOON';
  const urgentColor = deadline === 'OVERDUE' ? 'error' : 'warning';
  const start = order.actual_start_date || order.planned_start_date;

  const cell = { ...cellSx, px: 2, py: 1.25 };
  const numberCell = (value: number, color: string) => ({
    ...cell,
    ...monoSx,
    textAlign: 'right',
    fontSize: '0.875rem',
    color: untouched ? 'text.disabled' : value === 0 ? 'text.secondary' : color,
  });

  return (
    <TableRow
      id={trayCardId(order.id)}
      hover
      sx={{
        height: 64,
        scrollMarginTop: 160,
        bgcolor: highlighted ? (theme) => alpha(theme.palette.primary.main, 0.08) : zebra ? zebraBg : 'transparent',
        transition: 'background-color 0.4s ease',
      }}
    >
      <TableCell sx={cell}>
        <Link component="button" type="button" underline="hover" onClick={() => handlers.onView(order)} sx={{ ...monoSx, display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
          {order.code}
        </Link>
        <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled' }}>Inicio {formatDay(start)}</Typography>
      </TableCell>

      <TableCell sx={{ ...cell, maxWidth: 280 }}>
        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {batchName}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {order.male_caravan_ids.length} toros · {order.female_caravan_ids.length} vientres
        </Typography>
      </TableCell>

      <TableCell sx={cell}>
        <Box
          component="span"
          sx={(theme) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.625,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            fontWeight: urgent ? 600 : 500,
            color: urgent ? `${urgentColor}.dark` : 'text.secondary',
            ...(urgent && { bgcolor: alpha(theme.palette[urgentColor].main, 0.1), px: 1, py: 0.375, borderRadius: '999px' }),
          })}
        >
          <FuseSvgIcon size={14}>heroicons-outline:clock</FuseSvgIcon>
          {trayTimeLabel(order)}
        </Box>
      </TableCell>

      <TableCell sx={cell}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
          <Typography sx={{ ...monoSx, fontSize: '0.8rem', color: 'text.secondary' }}>
            <Box component="b" sx={{ color: 'text.primary' }}>
              {scanned}
            </Box>{' '}
            / {total}
          </Typography>
          <Typography sx={{ ...monoSx, fontSize: '0.72rem', color: 'text.disabled' }}>{progress}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={total > 0 && summary?.pending === 0 ? 'success' : 'primary'}
          sx={{ height: 5, borderRadius: 3 }}
        />
      </TableCell>

      <TableCell sx={numberCell(summary?.pregnant ?? 0, 'success.main')}>{untouched ? EMPTY : summary.pregnant}</TableCell>
      <TableCell sx={numberCell(summary?.empty ?? 0, 'text.primary')}>{untouched ? EMPTY : summary.empty}</TableCell>
      <TableCell sx={numberCell(provisional, 'warning.dark')}>{untouched ? EMPTY : provisional}</TableCell>
      <TableCell sx={{ ...cell, ...monoSx, textAlign: 'right', fontSize: '0.875rem', fontWeight: 700 }}>
        {rate !== null && rate !== undefined ? `${rate.toFixed(1)}%` : EMPTY}
      </TableCell>

      <TableCell sx={{ ...cell, px: 1.25 }}>
        <WorkCardActions variant="row" order={order} {...handlers} onViewFemales={() => setFemalesOpen(true)} />
        {femalesOpen && <FemalesVerdictDialog open onClose={() => setFemalesOpen(false)} order={order} batchName={batchName} caravans={caravans} />}
      </TableCell>
    </TableRow>
  );
}

import type { ComponentProps } from 'react';
import { alpha, Box, LinearProgress, Link, TableCell, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { getTrayDeadline } from '../../../utils/diagnosisTray';
import { orderHeadline } from '../../../utils/serviceOrderPhase';
import { queueDeadline, queuePhaseOf, queueProgress, serviceMethodLabel } from '../../../utils/servicesQueue';
import ServicesNextStepActions, { type QueueOrderHandlers } from './ServicesNextStepActions';

interface ServicesQueueRowProps extends QueueOrderHandlers {
  order: ServiceOrder;
  batchName: string;
  caravans: ComponentProps<typeof ServicesNextStepActions>['caravans'];
  zebra: boolean;
  isApproving: boolean;
}

const captionSx = { fontSize: '0.72rem', color: 'text.secondary' } as const;

/** One order of the queue: who, how it is served, how far it went, its window and its next step. */
export default function ServicesQueueRow({ order, batchName, caravans, zebra, isApproving, ...handlers }: ServicesQueueRowProps) {
  const { cellSx, zebraBg } = useGridCellStyles();
  const progress = queueProgress(order);
  const plazo = queueDeadline(order);
  const isDraft = queuePhaseOf(order) === 'DRAFT';
  const deadline = getTrayDeadline(order);
  const urgent = !isDraft && (deadline === 'OVERDUE' || deadline === 'CLOSING_SOON');
  const urgentColor = deadline === 'OVERDUE' ? 'error' : 'warning';
  const cell = { ...cellSx, px: 2, py: 1.25 };

  return (
    <TableRow
      hover
      onClick={() => handlers.onView(order)}
      sx={{ height: 68, cursor: 'pointer', bgcolor: zebra ? zebraBg : 'transparent' }}
    >
      <TableCell sx={{ ...cell, maxWidth: 280 }}>
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={(event) => {
            event.stopPropagation();
            handlers.onView(order);
          }}
          sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}
        >
          {order.code}
        </Link>
        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {batchName}
        </Typography>
      </TableCell>

      <TableCell sx={cell}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{orderHeadline(order)}</Typography>
        <Typography sx={captionSx}>{serviceMethodLabel(order)}</Typography>
      </TableCell>

      <TableCell sx={{ ...cell, minWidth: 240 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{progress.title}</Typography>
        <LinearProgress
          variant="determinate"
          value={progress.percent ?? 0}
          color={progress.tone}
          aria-label={progress.title}
          sx={{ height: 5, borderRadius: 3, my: 0.75, maxWidth: 240, opacity: progress.percent === null ? 0.4 : 1 }}
        />
        <Typography sx={captionSx}>{progress.caption}</Typography>
      </TableCell>

      <TableCell sx={cell}>
        {isDraft ? (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{plazo.title}</Typography>
        ) : (
          <Box
            component="span"
            sx={(theme) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.625,
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              fontWeight: urgent ? 700 : 600,
              color: urgent ? `${urgentColor}.dark` : 'text.primary',
              ...(urgent && { bgcolor: alpha(theme.palette[urgentColor].main, 0.1), px: 1, py: 0.375, borderRadius: '999px' }),
            })}
          >
            <FuseSvgIcon size={14}>heroicons-outline:clock</FuseSvgIcon>
            {plazo.title}
          </Box>
        )}
        <Typography sx={{ ...captionSx, mt: 0.25 }}>
          {plazo.caption}
        </Typography>
      </TableCell>

      <TableCell sx={{ ...cell, px: 1.5 }}>
        <ServicesNextStepActions order={order} batchName={batchName} caravans={caravans} isApproving={isApproving} {...handlers} />
      </TableCell>
    </TableRow>
  );
}

import { useState, type ComponentProps } from 'react';
import { alpha, Box, ButtonBase, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { QUEUE_PHASE_COLOR, type QueueSection } from '../../../utils/servicesQueue';
import ServicesQueueRow from './ServicesQueueRow';
import type { QueueOrderHandlers } from './ServicesNextStepActions';
import { dotColor } from './ServicesPhaseStrip';

interface ServicesQueueTableProps extends QueueOrderHandlers {
  sections: QueueSection[];
  caravans: ComponentProps<typeof ServicesQueueRow>['caravans'];
  batchNameOf: (order: ServiceOrder) => string;
  isApproving: boolean;
}

const COLUMNS = [
  { label: 'Orden · lote', minWidth: 220 },
  { label: 'Servicio', minWidth: 190 },
  { label: 'Avance', minWidth: 240 },
  { label: 'Plazo', minWidth: 180 },
  { label: 'Próximo paso', minWidth: 236 },
];

/** A phase of the queue: a tinted group row that folds its orders. */
function QueueGroup({ section, caravans, batchNameOf, isApproving, ...handlers }: Omit<ServicesQueueTableProps, 'sections'> & { section: QueueSection }) {
  const { cellSx } = useGridCellStyles();
  const [expanded, setExpanded] = useState(true);
  const color = QUEUE_PHASE_COLOR[section.phase];

  return (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={COLUMNS.length}
          sx={(theme) => ({
            ...cellSx,
            p: 0,
            bgcolor: color === 'grey' ? 'action.hover' : alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
          })}
        >
          <ButtonBase
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            sx={{ width: '100%', height: 42, px: 2, display: 'flex', justifyContent: 'flex-start', gap: 1.25 }}
          >
            <FuseSvgIcon size={16} sx={{ color: 'text.secondary', transition: 'transform 0.15s ease', transform: expanded ? 'rotate(90deg)' : 'none' }}>
              heroicons-outline:chevron-right
            </FuseSvgIcon>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor(color), flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {section.title} · {section.orders.length}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'left' }}>
              {section.subtitle}
            </Typography>
          </ButtonBase>
        </TableCell>
      </TableRow>
      {expanded &&
        section.orders.map((order, index) => (
          <ServicesQueueRow
            key={order.id}
            order={order}
            batchName={batchNameOf(order)}
            caravans={caravans}
            zebra={index % 2 === 1}
            isApproving={isApproving}
            {...handlers}
          />
        ))}
    </TableBody>
  );
}

/** The work queue as one table grouped by phase, closest to closing first. */
export default function ServicesQueueTable({ sections, ...rest }: ServicesQueueTableProps) {
  const { cellSx, headerBg } = useGridCellStyles();
  const headSx = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 2, py: 1.25, fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'text.secondary' } as const;

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '4px', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell key={column.label} sx={{ ...headSx, minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {sections.map((section) => (
            <QueueGroup key={section.phase} section={section} {...rest} />
          ))}
        </Table>
      </TableContainer>
      <Box sx={{ px: 2, py: 1.25, borderTop: 1, borderColor: 'divider', bgcolor: headerBg }}>
        <Typography variant="caption" color="text.secondary">
          Clic en la fila: detalle de la orden. El botón hace el próximo paso sin pasar por el detalle; el resto de las acciones está en ⋮.
        </Typography>
      </Box>
    </Paper>
  );
}

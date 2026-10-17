import { useState, type ComponentProps } from 'react';
import { alpha, Box, ButtonBase, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { TRAY_PHASE_COLOR, type TraySection } from '../../../utils/diagnosisTray';
import TrayTableRow from './TrayTableRow';
import type { TrayOrderHandlers } from './DiagnosisTrayTable';

interface TrayTableGroupProps extends TrayOrderHandlers {
  section: TraySection;
  columns: number;
  caravans: ComponentProps<typeof TrayTableRow>['caravans'];
  batchNameOf: (order: ServiceOrder) => string;
  highlightedOrderId: number | null;
}

/** A phase of the tray in the table: a tinted group row that collapses its orders. */
export default function TrayTableGroup({ section, columns, caravans, batchNameOf, highlightedOrderId, ...handlers }: TrayTableGroupProps) {
  const { cellSx } = useGridCellStyles();
  const [expanded, setExpanded] = useState(true);
  const color = TRAY_PHASE_COLOR[section.phase];

  return (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={columns}
          sx={(theme) => ({ ...cellSx, p: 0, bgcolor: alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.14 : 0.08) })}
        >
          <ButtonBase
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            sx={{ width: '100%', height: 44, px: 2, display: 'flex', justifyContent: 'flex-start', gap: 1.25 }}
          >
            <FuseSvgIcon size={16} sx={{ color: 'text.secondary', transition: 'transform 0.15s ease', transform: expanded ? 'rotate(90deg)' : 'none' }}>
              heroicons-outline:chevron-right
            </FuseSvgIcon>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${color}.main`, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{section.title}</Typography>
            <Box
              component="span"
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: `${color}.main`, bgcolor: 'background.paper', borderRadius: '999px', px: 1, py: 0.25 }}
            >
              {section.orders.length}
            </Box>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'left' }}>
              {section.subtitle}
            </Typography>
          </ButtonBase>
        </TableCell>
      </TableRow>
      {expanded &&
        section.orders.map((order, index) => (
          <TrayTableRow
            key={order.id}
            order={order}
            batchName={batchNameOf(order)}
            caravans={caravans}
            zebra={index % 2 === 1}
            highlighted={order.id === highlightedOrderId}
            {...handlers}
          />
        ))}
    </TableBody>
  );
}

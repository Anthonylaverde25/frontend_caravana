import type { ComponentProps } from 'react';
import { alpha, Box, Paper, Stack, Table, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { TraySection } from '../../../utils/diagnosisTray';
import TrayTableGroup from './TrayTableGroup';

/** What the tray can do with an order, shared by its cards and its table. */
export interface TrayOrderHandlers {
  onPrintSheet: (order: ServiceOrder) => void;
  onBulkEntry: (orderId: number) => void;
  onCloseOrder: (order: ServiceOrder) => void;
  onWithdrawBulls: (order: ServiceOrder) => void;
  onView: (order: ServiceOrder) => void;
}

interface DiagnosisTrayTableProps extends TrayOrderHandlers {
  sections: TraySection[];
  caravans: ComponentProps<typeof TrayTableGroup>['caravans'];
  batchNameOf: (order: ServiceOrder) => string;
  highlightedOrderId: number | null;
}

interface Column {
  label: string;
  minWidth: number;
  align?: 'right';
  hint?: string;
}

const ORDER_COLUMNS: Column[] = [
  { label: 'Código', minWidth: 124 },
  { label: 'Lote', minWidth: 220 },
  { label: 'Plazo', minWidth: 176 },
];
const DIAGNOSIS_COLUMNS: Column[] = [
  { label: 'Tactados', minWidth: 196 },
  { label: 'Preñadas', minWidth: 88, align: 'right' },
  { label: 'Vacías', minWidth: 76, align: 'right' },
  { label: 'Prov.', minWidth: 68, align: 'right', hint: 'Vacías provisorias: tactadas, fuera de la tasa hasta quedar firmes' },
  { label: 'Preñez', minWidth: 92, align: 'right' },
];
const ACTIONS_WIDTH = 252;
const COLUMN_COUNT = ORDER_COLUMNS.length + DIAGNOSIS_COLUMNS.length + 1;

/** The diagnosis tray as one table grouped by phase: every figure of the cards, one per column. */
export default function DiagnosisTrayTable({ sections, caravans, batchNameOf, highlightedOrderId, ...handlers }: DiagnosisTrayTableProps) {
  const { cellSx, headerBg } = useGridCellStyles();
  const headSx = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 1.5, py: 1.25, fontSize: '0.8rem', whiteSpace: 'nowrap' } as const;
  const groupSx = { ...headSx, py: 0.75, fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase' } as const;

  const columnHead = (column: Column) => (
    <TableCell key={column.label} align={column.align} sx={{ ...headSx, minWidth: column.minWidth, color: 'text.secondary' }}>
      {column.hint ? (
        <Tooltip title={column.hint}>
          <span>{column.label}</span>
        </Tooltip>
      ) : (
        column.label
      )}
    </TableCell>
  );

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '4px', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 260px)' }}>
        <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth: 1240 }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={ORDER_COLUMNS.length} sx={{ ...groupSx, color: 'text.secondary' }}>
                Orden
              </TableCell>
              <TableCell
                colSpan={DIAGNOSIS_COLUMNS.length}
                sx={(theme) => ({ ...groupSx, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `2px solid ${theme.palette.primary.main}` })}
              >
                Diagnóstico de gestación
              </TableCell>
              <TableCell sx={groupSx} />
            </TableRow>
            {/* Below the group row: sticky offset so both header rows stay visible. */}
            <TableRow sx={{ '& th': { top: 31 } }}>
              {ORDER_COLUMNS.map(columnHead)}
              {DIAGNOSIS_COLUMNS.map(columnHead)}
              <TableCell align="right" sx={{ ...headSx, minWidth: ACTIONS_WIDTH, color: 'text.secondary' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          {sections.map((section) => (
            <TrayTableGroup
              key={section.phase}
              section={section}
              columns={COLUMN_COUNT}
              caravans={caravans}
              batchNameOf={batchNameOf}
              highlightedOrderId={highlightedOrderId}
              {...handlers}
            />
          ))}
        </Table>
      </TableContainer>
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        useFlexGap
        sx={{ gap: '8px 20px', px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: headerBg }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ flex: '1 1 420px' }}>
          Preñez = preñadas / (preñadas + vacías firmes). Las vacías provisorias (Prov.) cuentan como tactadas pero quedan fuera de la tasa.
        </Typography>
        {[
          { label: 'Vencida', color: 'error.main' },
          { label: 'Por vencer', color: 'warning.main' },
        ].map((item) => (
          <Stack key={item.label} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

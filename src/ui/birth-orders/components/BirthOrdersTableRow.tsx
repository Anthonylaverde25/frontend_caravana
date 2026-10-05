import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Chip, IconButton, LinearProgress, Stack, TableCell, TableRow, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthOrderSummary } from '@/features/birth-orders/types';
import TransferOrderStatusChip, {
  TransferOrderKindChip,
  useTransferOrderStatusColor
} from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import { formatDateTime, outcomesOf, periodOf, sheetUrl, sourcesOf, useBirthOrderTableStyles } from './birthOrderFormat';

interface BirthOrdersTableRowProps {
  order: BirthOrderSummary;
  position: number;
  isZebra: boolean;
  onOpen: (order: BirthOrderSummary) => void;
  onIssue: (order: BirthOrderSummary) => void;
}

const sheetTooltip = (order: BirthOrderSummary): string =>
  order.is_editable
    ? 'Previsualizar planilla (borrador: no se imprime)'
    : order.is_open
      ? 'Imprimir la planilla PAR-01 con los vientres pendientes'
      : 'Ver planilla (sólo consulta)';

/** One birth order, in the two-line cell pattern: the fact in bold, what qualifies it underneath. */
export const BirthOrdersTableRow: React.FC<BirthOrdersTableRowProps> = ({ order, position, isZebra, onOpen, onIssue }) => {
  const navigate = useNavigate();
  const colors = useTransferOrderStatusColor();
  const { bodyCell, primaryText, captionText, zebraBg, border, isDark } = useBirthOrderTableStyles();
  const color = colors[order.status];
  const progress = order.head_count > 0 ? (order.resolved_head_count / order.head_count) * 100 : 0;
  const iconSx = { border: '1px solid', borderColor: border, borderRadius: '6px', p: 0.5 };
  const by = order.requested_by?.name ? ` · ${order.requested_by.name}` : '';

  return (
    <TableRow hover onClick={() => onOpen(order)} sx={{ cursor: 'pointer', bgcolor: isZebra ? zebraBg : 'inherit' }}>
      <TableCell sx={{ ...bodyCell, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
        {position}
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
          {order.code}
        </Typography>
        <Typography variant="caption" sx={captionText}>
          {order.kind === 'REGISTERED'
            ? `Registrada ${formatDateTime(order.created_at)}${by}`
            : order.emitted_at
              ? `Emitida ${formatDateTime(order.emitted_at)}${by}`
              : `Sin emitir${by}`}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCell, maxWidth: 260 }}>
        <Typography sx={primaryText}>
          {order.planned_head_count} vientre(s)
          {order.unplanned_head_count > 0 ? ` + ${order.unplanned_head_count} fuera de la orden` : ''}
        </Typography>
        <Typography variant="caption" noWrap title={sourcesOf(order)} sx={captionText}>
          {sourcesOf(order)}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={primaryText}>{periodOf(order)}</Typography>
        <Typography variant="caption" sx={captionText}>
          {order.responsable ?? 'Sin responsable'}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TransferOrderStatusChip status={order.status} />
          {order.kind === 'REGISTERED' && <TransferOrderKindChip />}
          {order.overdue_head_count > 0 && (
            <Tooltip title="Hembras que pasaron su fecha sin parir: la orden sigue abierta hasta que paran o se registre la pérdida.">
              <Chip
                size="small"
                color="warning"
                icon={<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
                label={`${order.overdue_head_count} parto(s) vencido(s)`}
                sx={{ fontWeight: 700, height: 22, '& .MuiChip-label': { px: 0.75 } }}
              />
            </Tooltip>
          )}
          {order.is_editable && (
            <Tooltip title="Emitir orden">
              <IconButton
                size="small"
                aria-label={`Emitir la orden ${order.code}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onIssue(order);
                }}
                sx={{ ...iconSx, p: 0.4, color: colors.ISSUED, borderColor: alpha(colors.ISSUED, 0.35) }}
              >
                <FuseSvgIcon size={15}>heroicons-outline:paper-airplane</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
      <TableCell sx={{ ...bodyCell, textAlign: 'center' }}>
        {order.kind !== 'REGISTERED' && (
          <Tooltip title={sheetTooltip(order)}>
            <IconButton
              size="small"
              aria-label={`Abrir la planilla de la orden ${order.code}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(sheetUrl(order.id));
              }}
              sx={iconSx}
            >
              <FuseSvgIcon size={17}>heroicons-outline:document-text</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ display: 'inline-flex', color: order.printed_at ? 'text.primary' : 'text.disabled' }}>
            <FuseSvgIcon size={17}>{order.printed_at ? 'heroicons-outline:printer' : 'heroicons-outline:computer-desktop'}</FuseSvgIcon>
          </Box>
          <Box>
            <Typography sx={{ ...primaryText, fontWeight: 600 }}>{order.printed_at ? 'Impresa' : 'Sin papel'}</Typography>
            {order.printed_at && (
              <Typography variant="caption" sx={captionText}>
                {formatDateTime(order.printed_at)}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
      <TableCell sx={{ ...bodyCell, borderRight: 0 }}>
        <Typography sx={primaryText}>
          {order.resolved_head_count} / {order.head_count} vientres
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            my: 0.5,
            height: 5,
            borderRadius: 3,
            bgcolor: alpha(color, isDark ? 0.2 : 0.12),
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
          }}
        />
        <Typography variant="caption" sx={captionText}>
          {outcomesOf(order)}
          {order.skipped_head_count > 0 ? ` · ${order.skipped_head_count} sin parir con esta orden` : ''}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default BirthOrdersTableRow;

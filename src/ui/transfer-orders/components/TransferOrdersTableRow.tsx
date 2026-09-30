import React from 'react';
import { useNavigate } from 'react-router';
import { Box, IconButton, LinearProgress, Stack, TableCell, TableRow, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { TransferOrderSummary } from '@/features/transfer-orders/types';
import TransferOrderStatusChip, { TransferOrderKindChip, useTransferOrderStatusColor } from './TransferOrderStatusChip';
import { formatDate, formatDateTime, useTransferOrderTableStyles } from './transferOrderFormat';

interface TransferOrdersTableRowProps {
  order: TransferOrderSummary;
  /** Position in the whole filtered list, for the "#" column. */
  position: number;
  isZebra: boolean;
  onOpen: (order: TransferOrderSummary) => void;
  onIssue: (order: TransferOrderSummary) => void;
}

/** What opening the sheet will do, said before the click: preview, print, or look up. */
const sheetTooltip = (order: TransferOrderSummary): string =>
  order.is_editable
    ? 'Previsualizar planilla (borrador: no se imprime)'
    : order.is_open
      ? 'Abrir planilla para imprimir'
      : 'Ver planilla (sólo consulta)';

const destinationsOf = (order: TransferOrderSummary): string => {
  if (order.destination_mode === 'single') return order.destinations[0]?.label ?? '—';

  const named = order.destinations.map((d) => d.label).join(', ');
  const chute = order.unassigned_head_count > 0 ? `${order.unassigned_head_count} en la manga` : '';

  return [named, chute].filter(Boolean).join(' · ') || 'Se decide en la manga';
};

/**
 * One order, in the two-line cell pattern of the canonical datatable: the fact in bold, what
 * qualifies it underneath.
 */
export const TransferOrdersTableRow: React.FC<TransferOrdersTableRowProps> = ({
  order,
  position,
  isZebra,
  onOpen,
  onIssue
}) => {
  const navigate = useNavigate();
  const colors = useTransferOrderStatusColor();
  const { bodyCell, primaryText, captionText, zebraBg, border, isDark } = useTransferOrderTableStyles();
  const color = colors[order.status];
  const progress = order.planned_head_count > 0 ? (order.moved_head_count / order.planned_head_count) * 100 : 0;
  const iconSx = { border: '1px solid', borderColor: border, borderRadius: '6px', p: 0.5 };

  return (
    <TableRow
      hover
      onClick={() => onOpen(order)}
      sx={{ cursor: 'pointer', bgcolor: isZebra ? zebraBg : 'inherit', transition: 'background-color 0.15s ease' }}
    >
      {/* Datos de la orden */}
      <TableCell sx={{ ...bodyCell, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
        {position}
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
          {order.code}
        </Typography>
        <Typography variant="caption" sx={captionText}>
          {order.kind === 'REGISTERED'
            ? `Registrada ${formatDateTime(order.created_at)}${order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}`
            : order.emitted_at
              ? `Emitida ${formatDateTime(order.emitted_at)}${order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}`
              : `Sin emitir${order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}`}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={primaryText}>{order.source_batch.name ?? '—'}</Typography>
        <Typography variant="caption" sx={captionText}>
          {order.source_activity_name ?? '—'}
        </Typography>
      </TableCell>

      {/* Destino, right beside the origin: the order reads as "from here, to there". */}
      <TableCell sx={{ ...bodyCell, maxWidth: 240 }}>
        <Typography sx={primaryText}>{order.destination_activity.name ?? '—'}</Typography>
        <Typography variant="caption" noWrap title={destinationsOf(order)} sx={captionText}>
          {destinationsOf(order)}
        </Typography>
      </TableCell>
      {/* Estado / Documento */}
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TransferOrderStatusChip status={order.status} />
          {/* Loaded after the movement happened: it never went through draft or issue. */}
          {order.kind === 'REGISTERED' && <TransferOrderKindChip />}
          {/* A draft is the one state moved forward by hand; the rest follow from what moved. */}
          {order.is_editable && (
            <Tooltip title="Emitir orden">
              <IconButton
                size="small"
                aria-label={`Emitir la orden ${order.code}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onIssue(order);
                }}
                sx={{
                  ...iconSx,
                  p: 0.4,
                  color: colors.ISSUED,
                  borderColor: alpha(colors.ISSUED, 0.35),
                  '&:hover': { bgcolor: alpha(colors.ISSUED, 0.1) }
                }}
              >
                <FuseSvgIcon size={15}>heroicons-outline:paper-airplane</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
      <TableCell sx={{ ...bodyCell, textAlign: 'center' }}>
        <Tooltip title={sheetTooltip(order)}>
          <IconButton
            size="small"
            aria-label={`Abrir la planilla de la orden ${order.code}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/work-templates/CACT-01?transferOrderId=${order.id}`);
            }}
            sx={iconSx}
          >
            <FuseSvgIcon size={17}>heroicons-outline:document-text</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ display: 'inline-flex', color: order.printed_at ? 'text.primary' : 'text.disabled' }}>
            <FuseSvgIcon size={17}>
              {order.printed_at ? 'heroicons-outline:printer' : 'heroicons-outline:computer-desktop'}
            </FuseSvgIcon>
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
      {/* Ejecución */}
      <TableCell sx={bodyCell}>
        <Typography sx={primaryText}>
          {order.moved_head_count} / {order.planned_head_count} cab.
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
        {order.skipped_head_count > 0 && (
          <Typography variant="caption" sx={captionText}>
            {order.skipped_head_count} no viajaron
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap', borderRight: 0 }}>{formatDate(order.movement_date)}</TableCell>
    </TableRow>
  );
};

export default TransferOrdersTableRow;

import React from 'react';
import { useNavigate } from 'react-router';
import { Box, IconButton, LinearProgress, Stack, TableCell, TableRow, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';
import TransferOrderStatusChip, {
  TransferOrderKindChip,
  useTransferOrderStatusColor
} from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import { destinationsOf, formatDate, formatDateTime, sheetUrl, sourcesOf, useWeaningOrderTableStyles } from './weaningOrderFormat';

interface WeaningOrdersTableRowProps {
  order: WeaningOrderSummary;
  position: number;
  isZebra: boolean;
  onOpen: (order: WeaningOrderSummary) => void;
  onIssue: (order: WeaningOrderSummary) => void;
}

const sheetTooltip = (order: WeaningOrderSummary): string =>
  order.is_editable
    ? 'Previsualizar planilla (borrador: no se imprime)'
    : order.is_open
      ? 'Abrir planilla DEST-01 para imprimir'
      : 'Ver planilla (sólo consulta)';

/** One weaning order, in the two-line cell pattern: the fact in bold, what qualifies it underneath. */
export const WeaningOrdersTableRow: React.FC<WeaningOrdersTableRowProps> = ({ order, position, isZebra, onOpen, onIssue }) => {
  const navigate = useNavigate();
  const colors = useTransferOrderStatusColor();
  const { bodyCell, primaryText, captionText, zebraBg, border, isDark } = useWeaningOrderTableStyles();
  const color = colors[order.status];
  const progress = order.planned_head_count > 0 ? (order.weaned_head_count / order.planned_head_count) * 100 : 0;
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
            ? `Registrado ${formatDateTime(order.created_at)}${by}`
            : order.emitted_at
              ? `Emitida ${formatDateTime(order.emitted_at)}${by}`
              : `Sin emitir${by}`}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCell, maxWidth: 240 }}>
        <Typography sx={primaryText}>{order.planned_head_count} cría(s)</Typography>
        <Typography variant="caption" noWrap title={sourcesOf(order)} sx={captionText}>
          {sourcesOf(order)}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCell, maxWidth: 240 }}>
        <Typography sx={primaryText}>{order.destination_mode === 'single' ? 'Un lote para todas' : 'Lote por cría'}</Typography>
        <Typography variant="caption" noWrap title={destinationsOf(order)} sx={captionText}>
          {destinationsOf(order)}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={primaryText}>{order.weaning_type_label ?? 'Tipo sin declarar'}</Typography>
        <Typography variant="caption" sx={captionText}>
          Categoría: {order.category_mode_label.toLowerCase()}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TransferOrderStatusChip status={order.status} />
          {order.kind === 'REGISTERED' && <TransferOrderKindChip />}
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
      <TableCell sx={bodyCell}>
        <Typography sx={primaryText}>
          {order.weaned_head_count} / {order.planned_head_count} crías
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
            {order.skipped_head_count} no se destetaron con esta orden
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap', borderRight: 0 }}>{formatDate(order.weaning_date)}</TableCell>
    </TableRow>
  );
};

export default WeaningOrdersTableRow;

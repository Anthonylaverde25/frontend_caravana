import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, IconButton, LinearProgress, Stack, TableCell, TableRow, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrderSummary } from '@/features/entry-orders/types';
import { TransferOrderKindChip } from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import EntryOrderStatusChip, { useEntryOrderStatusColor } from './EntryOrderStatusChip';
import { useReceiptSheetPrint } from './useReceiptSheetPrint';
import { breedsOf, formatDate, formatDateTime, originOf, sheetUrl, tracksReception, troopOf, useEntryOrderTableStyles } from './entryOrderFormat';

interface EntryOrdersTableRowProps {
  order: EntryOrderSummary;
  position: number;
  isZebra: boolean;
  onOpen: (order: EntryOrderSummary) => void;
  onLoadDte: (order: EntryOrderSummary) => void;
}

/** One entry order, in the two-line cell pattern: the fact in bold, what qualifies it underneath. */
export const EntryOrdersTableRow: React.FC<EntryOrdersTableRowProps> = ({ order, position, isZebra, onOpen, onLoadDte }) => {
  const navigate = useNavigate();
  const colors = useEntryOrderStatusColor();
  const { bodyCell, primaryText, captionText, zebraBg, border, isDark } = useEntryOrderTableStyles();
  const color = colors[order.status];
  const progress = order.head_count > 0 ? Math.min(100, (order.received_count / order.head_count) * 100) : 0;
  const iconSx = { border: '1px solid', borderColor: border, borderRadius: '6px', p: 0.5 };
  const receiptSheet = useReceiptSheetPrint();
  // The DTEs whose caravans can still be received on an ING-03.
  const receptionDtes = order.accepts_reception ? order.dtes.filter((d) => d.in_transit_count > 0) : [];
  const activeSheet = receptionDtes.length === 1 ? order.receipt_sheets?.find((r) => r.dte_id === receptionDtes[0].id && r.is_active) : undefined;
  const receptionTooltip =
    receptionDtes.length > 1
      ? `Hoja de recepción ING-03: ${receptionDtes.length} DTE en tránsito, elegí cuál en la orden`
      : activeSheet
        ? `Hoja de recepción ING-03 · ${activeSheet.label} del DTE ${activeSheet.dte_number}`
        : `Generar hoja de recepción ING-03 del DTE ${receptionDtes[0]?.dte_number ?? ''}`;
  const stop = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <TableRow hover onClick={() => onOpen(order)} sx={{ cursor: 'pointer', bgcolor: isZebra ? zebraBg : 'inherit' }}>
      <TableCell sx={{ ...bodyCell, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>{position}</TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>{order.code}</Typography>
        <Typography variant="caption" sx={captionText}>
          N° {order.number}
          {order.auction_number ? ` · Subasta ${order.auction_number}` : ''}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCell, maxWidth: 240 }}>
        <Typography sx={primaryText} noWrap title={order.provider.name ?? ''}>
          {order.provider.name ?? '—'}
        </Typography>
        <Typography variant="caption" noWrap title={originOf(order)} sx={captionText}>
          {order.farm.name}
          {order.farm.renspa ? ` · ${order.farm.renspa}` : ''}
        </Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCell, maxWidth: 260 }}>
        <Typography sx={primaryText} noWrap title={troopOf(order)}>
          {troopOf(order)}
        </Typography>
        <Typography variant="caption" noWrap title={breedsOf(order)} sx={captionText}>
          {breedsOf(order)}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={{ ...primaryText, fontFamily: 'monospace' }}>{order.batch_name ?? '—'}</Typography>
        <Typography variant="caption" sx={captionText}>
          {order.batch ? 'Lote externo' : 'Se crea al confirmar'}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <EntryOrderStatusChip status={order.status} progress={order} />
          {order.kind === 'REGISTERED' && <TransferOrderKindChip />}
        </Stack>
      </TableCell>
      <TableCell sx={{ ...bodyCell, textAlign: 'center' }}>
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title={order.is_editable ? 'Previsualizar ING-02 (borrador: no se imprime)' : 'Abrir planilla ING-02'}>
            <IconButton size="small" aria-label={`Planilla de la orden ${order.code}`} onClick={stop(() => navigate(sheetUrl(order.id)))} sx={iconSx}>
              <FuseSvgIcon size={17}>heroicons-outline:document-text</FuseSvgIcon>
            </IconButton>
          </Tooltip>
          {receptionDtes.length > 0 && (
            <Tooltip title={receptionTooltip}>
              <IconButton
                size="small"
                aria-label={`Hoja de recepción ING-03 de la orden ${order.code}`}
                disabled={receiptSheet.isPending}
                onClick={stop(() => (receptionDtes.length === 1 ? receiptSheet.open(order, receptionDtes[0]) : onOpen(order)))}
                sx={{ ...iconSx, color, borderColor: alpha(color, 0.4) }}
              >
                <FuseSvgIcon size={17}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
      <TableCell sx={bodyCell}>
        {order.accepts_dte ? (
          <Button
            size="small"
            variant="outlined"
            onClick={stop(() => onLoadDte(order))}
            startIcon={<FuseSvgIcon size={15}>heroicons-outline:document-arrow-down</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', py: 0.25, color, borderColor: alpha(color, 0.4) }}
          >
            Cargar DTE
          </Button>
        ) : order.accepts_reception ? (
          <Button
            size="small"
            variant="outlined"
            onClick={stop(() => onOpen(order))}
            startIcon={<FuseSvgIcon size={15}>heroicons-outline:truck</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', py: 0.25, color, borderColor: alpha(color, 0.4) }}
          >
            Recibir
          </Button>
        ) : !tracksReception(order) ? (
          <Typography sx={{ ...captionText, fontSize: '0.8rem' }}>—</Typography>
        ) : (
          <Box>
            <Typography sx={{ ...primaryText, fontWeight: 600 }}>{order.dte_count === 0 ? 'Sin DTE' : `${order.dte_count} DTE`}</Typography>
            {order.dtes[0] && (
              <Typography variant="caption" sx={captionText}>
                {order.dtes.map((d) => d.dte_number).join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </TableCell>
      <TableCell sx={bodyCell}>
        {!tracksReception(order) ? (
          <Typography variant="caption" sx={captionText}>
            {order.status === 'DRAFT' ? 'Sin confirmar' : 'Sin recepción'}
          </Typography>
        ) : (
          <>
            <Typography sx={primaryText}>
              {order.received_count} / {order.head_count} recibidas
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
              {[
                order.in_transit_count > 0 ? `${order.in_transit_count} en tránsito` : null,
                order.missing_count > 0 ? `${order.missing_count} no llegarán` : null,
                order.with_dte_count > order.head_count ? `${order.with_dte_count} con DTE` : null,
                order.in_transit_count === 0 && order.first_dte_at ? `Primer DTE ${formatDateTime(order.first_dte_at)}` : null
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </>
        )}
      </TableCell>
      <TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap', borderRight: 0 }}>{formatDate(order.purchase_date)}</TableCell>
    </TableRow>
  );
};

export default EntryOrdersTableRow;

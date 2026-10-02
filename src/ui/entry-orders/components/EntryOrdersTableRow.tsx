import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, IconButton, LinearProgress, Stack, TableCell, TableRow, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrderSummary } from '@/features/entry-orders/types';
import { TransferOrderKindChip } from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import EntryOrderStatusChip, { useEntryOrderStatusColor } from './EntryOrderStatusChip';
import { breedsOf, formatDate, formatDateTime, originOf, sheetUrl, troopOf, useEntryOrderTableStyles } from './entryOrderFormat';

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
  const progress = order.head_count > 0 ? (order.entered_count / order.head_count) * 100 : 0;
  const iconSx = { border: '1px solid', borderColor: border, borderRadius: '6px', p: 0.5 };
  const stop = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

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
        <Typography sx={{ ...primaryText, fontFamily: 'monospace' }}>{order.batch_name}</Typography>
        <Typography variant="caption" sx={captionText}>
          {order.batch ? 'Lote externo' : 'Se crea al confirmar'}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCell}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <EntryOrderStatusChip status={order.status} />
          {order.kind === 'REGISTERED' && <TransferOrderKindChip />}
        </Stack>
      </TableCell>
      <TableCell sx={{ ...bodyCell, textAlign: 'center' }}>
        <Tooltip title={order.is_editable ? 'Previsualizar (borrador: no se imprime)' : 'Abrir planilla ING-02'}>
          <IconButton size="small" aria-label={`Planilla de la orden ${order.code}`} onClick={stop(() => navigate(sheetUrl(order.id)))} sx={iconSx}>
            <FuseSvgIcon size={17}>heroicons-outline:document-text</FuseSvgIcon>
          </IconButton>
        </Tooltip>
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
        ) : (
          <Box>
            <Typography sx={{ ...primaryText, fontWeight: 600 }}>
              {order.dte_count === 0 ? 'Sin DTE' : `${order.dte_count} DTE`}
            </Typography>
            {order.dtes[0] && (
              <Typography variant="caption" sx={captionText}>
                {order.dtes.map((d) => d.dte_number).join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </TableCell>
      <TableCell sx={bodyCell}>
        <Typography sx={primaryText}>
          {order.entered_count} / {order.head_count} cabezas
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
        {order.first_dte_at && (
          <Typography variant="caption" sx={captionText}>
            Primer DTE {formatDateTime(order.first_dte_at)}
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap', borderRight: 0 }}>{formatDate(order.purchase_date)}</TableCell>
    </TableRow>
  );
};

export default EntryOrdersTableRow;

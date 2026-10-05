import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrder, EntryOrderReceiptSheet } from '@/features/entry-orders/types';
import { ing03Url } from '@/ui/work-templates/templates/ing03';
import { caravansOf, formatDateTime } from '../entryOrderFormat';

/** "2 de 3 hojas escaneadas · falta la hoja 3". */
const progressOf = (sheet: EntryOrderReceiptSheet): string => {
  const scanned = sheet.processed_pages.length;
  const pages = sheet.page_count === 1 ? '1 hoja' : `${sheet.page_count} hojas`;

  if (sheet.status === 'PROCESSED') return `${pages} · todas escaneadas`;
  if (scanned === 0) return `${pages} · ninguna escaneada`;

  const missing = sheet.missing_pages.length === 1 ? `falta la hoja ${sheet.missing_pages[0]}` : `faltan las hojas ${sheet.missing_pages.join(', ')}`;

  return `${scanned} de ${pages} escaneadas · ${missing}`;
};

/**
 * The ING-03 sheets issued for the order's DTEs: which paper went out to the chute, who issued it,
 * whether it was printed, and which pages came back scanned. A sheet still out is highlighted: it is
 * the paper that must not get lost.
 */
export const EntryOrderReceiptSheetList: React.FC<{ order: EntryOrder }> = ({ order }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const active = theme.palette.mode === 'dark' ? '#60a5fa' : '#0a6ed1';
  const sheets = order.receipt_sheets ?? [];

  if (sheets.length === 0) return null;

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Hojas de recepción (ING-03)
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {[...sheets].reverse().map((sheet) => (
          <Paper
            key={sheet.id}
            elevation={0}
            onClick={() => navigate(ing03Url(order.id, sheet.id))}
            sx={{
              p: 1.25,
              border: 1,
              borderColor: sheet.is_active ? alpha(active, 0.4) : 'divider',
              bgcolor: sheet.is_active ? alpha(active, 0.04) : undefined,
              borderRadius: '6px',
              cursor: 'pointer',
              opacity: sheet.status === 'REPLACED' ? 0.7 : 1,
              '&:hover': { borderColor: active }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FuseSvgIcon size={18} color="action">heroicons-outline:document-text</FuseSvgIcon>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {sheet.label} · DTE {sheet.dte_number}
                  </Typography>
                  <Chip
                    size="small"
                    label={sheet.status_label}
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: sheet.is_active ? active : 'text.secondary', bgcolor: sheet.is_active ? alpha(active, 0.12) : 'action.hover' }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {caravansOf(sheet.caravan_ids.length)} · {progressOf(sheet)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Emitida {sheet.created_at ? formatDateTime(sheet.created_at) : ''}
                  {sheet.issued_by?.name ? ` por ${sheet.issued_by.name}` : ''}
                  {sheet.printed_at ? ` · impresa ${formatDateTime(sheet.printed_at)}` : ' · sin imprimir'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default EntryOrderReceiptSheetList;

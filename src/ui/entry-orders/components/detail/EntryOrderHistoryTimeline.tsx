import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ENTRY_ORDER_INCIDENT_LABELS, ENTRY_ORDER_STATUS_LABELS, EntryOrderHistoryEntry } from '@/features/entry-orders/types';
import { useEntryOrderStatusColor } from '../EntryOrderStatusChip';
import { formatDateTime } from '../entryOrderFormat';

const describe = (entry: EntryOrderHistoryEntry): string => {
  const to = ENTRY_ORDER_STATUS_LABELS[entry.to_status];
  const meta = entry.metadata as {
    dte_number?: string | null;
    head_count?: number;
    pending_dte?: number;
    action?: string;
    reception?: boolean;
    method?: 'CHUTE' | 'MANUAL' | 'SHEET';
    received?: number;
    missing?: number;
    receipt_sheet?: string | null;
    pages?: number[] | null;
    expected_head_count?: number;
    from?: number;
    to?: number;
    weighing_mode_label?: string;
    reference_mode_label?: string;
    incident_resolved?: string;
  } | null;

  if (meta?.action === 'receipt_sheet_issued') {
    const weighing = [meta.weighing_mode_label, meta.reference_mode_label].filter(Boolean).map((label) => ` · ${label!.toLowerCase()}`).join('');

    return `Hoja de recepción ${meta.receipt_sheet} emitida: DTE ${meta.dte_number}, ${meta.expected_head_count ?? 0} cabeza(s) en tránsito${weighing}`;
  }

  if (meta?.action === 'dte_head_count_corrected') {
    return `DTE ${meta.dte_number} corregido: de ${meta.from} a ${meta.to} cabezas → ${to}`;
  }

  if (meta?.action === 'receipt_sheet_weighing_changed') {
    return `Hoja de recepción ${meta.receipt_sheet}: ahora con ${meta.weighing_mode_label?.toLowerCase() ?? 'otro modo de peso'}`;
  }

  if (meta?.action === 'receipt_sheet_reference_changed' || meta?.action === 'receipt_sheet_configured') {
    const now = [meta.weighing_mode_label, meta.reference_mode_label].filter(Boolean).map((label) => label!.toLowerCase());

    return `Hoja de recepción ${meta.receipt_sheet}: ahora ${now.join(' y ') || 'con otra configuración'}`;
  }

  // A reception also names its DTE, so it is recognised first.
  if (meta?.reception) {
    const pages = meta.pages?.length ? ` (hoja${meta.pages.length > 1 ? 's' : ''} ${meta.pages.join(', ')})` : '';
    const where =
      meta.method === 'SHEET'
        ? `con la planilla ${meta.receipt_sheet ?? 'ING-03'}${pages}`
        : meta.method === 'CHUTE'
          ? 'en manga'
          : meta.dte_number
            ? `del DTE ${meta.dte_number}`
            : 'a mano';
    const missing = meta.missing ? ` · ${meta.missing} no llegarán` : '';

    return `Recepción ${where}: ${meta.received ?? 0} recibida(s)${missing} → ${to}`;
  }

  if (meta?.incident_resolved) {
    return `Novedad resuelta (${ENTRY_ORDER_INCIDENT_LABELS[meta.incident_resolved as keyof typeof ENTRY_ORDER_INCIDENT_LABELS] ?? meta.incident_resolved})`;
  }

  if (meta?.dte_number) {
    const pending = meta.pending_dte ? `, ${meta.pending_dte} siguen esperando DTE` : '';

    return `DTE ${meta.dte_number}: ${meta.head_count ?? 0} cabeza(s)${pending} → ${to}`;
  }

  if (meta?.action === 'printed') return 'Planilla impresa';
  if (meta?.action === 'draft_updated') return 'Borrador modificado';
  if (entry.from_status === null) return `Creada (${to})`;

  return entry.from_status === entry.to_status ? to : `${ENTRY_ORDER_STATUS_LABELS[entry.from_status]} → ${to}`;
};

/** What happened to the order, oldest first: the purchase, each DTE, each reception, the incidents resolved and how it ended. */
export const EntryOrderHistoryTimeline: React.FC<{ history: EntryOrderHistoryEntry[] }> = ({ history }) => {
  const colors = useEntryOrderStatusColor();

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Historial
      </Typography>
      <Stack spacing={0} sx={{ mt: 0.5 }}>
        {history.map((entry, index) => (
          <Box key={entry.id} sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.6 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[entry.to_status] }} />
              {index < history.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
            </Box>
            <Box sx={{ pb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {describe(entry)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(entry.created_at)}
                {entry.action_user?.name ? ` · ${entry.action_user.name}` : ''}
              </Typography>
              {entry.reason && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {entry.reason}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default EntryOrderHistoryTimeline;

import React from 'react';
import { Alert, Box, Paper, Stack, TextField, Typography } from '@mui/material';
import type { EntryOrder, EntryOrderDte } from '@/features/entry-orders/types';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import ReceivedHeadsField, { HeadsComparison } from './ReceivedHeadsField';
import TriAttachment from './TriAttachment';
import type { DteReception } from './useDteReception';

interface FullReceptionSidebarProps {
  order: EntryOrder;
  dte: EntryOrderDte;
  reception: DteReception;
}

const Figure: React.FC<{ label: string; value: number; tone?: 'warning' | 'success' }> = ({ label, value, tone }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1, color: tone ? `${tone}.main` : 'text.primary' }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>
      {label}
    </Typography>
  </Box>
);

/**
 * The side of "Recibir y registrar caravanas": when it arrived and how many head — which closes the
 * DTE —, the SENASA TRI to read the caravans from, and the count as it goes: received, with caravan,
 * without one and injured.
 */
export const FullReceptionSidebar: React.FC<FullReceptionSidebarProps> = ({ order, dte, reception }) => {
  const { expected, received, caravans, rows } = reception;
  const withoutCaravan = Math.max(0, (received ?? 0) - caravans);

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
        <Typography sx={sectionTitleSx}>1. Recepción del DTE</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {dte.head_count} declaradas · {dte.received_count} recibidas · {expected} en tránsito
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField
            label="Fecha de recepción"
            type="date"
            required
            variant="filled"
            value={reception.receivedAt}
            onChange={(e) => reception.setReceivedAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={filledInputProps}
            inputProps={{ max: reception.maxDate, min: reception.minDate }}
          />
          <ReceivedHeadsField expected={expected} value={reception.heads} onChange={reception.setHeads} error={reception.headsError} />
          {received != null && <HeadsComparison expected={expected} received={received} note={reception.note} onNote={reception.setNote} />}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1 }}>2. Leer caravanas del TRI</Typography>
        <TriAttachment orderId={order.id} onCaravans={rows.appendTags} onTriNumber={reception.setTriNumber} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
        <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>Resumen</Typography>
        <Stack direction="row" spacing={1.5}>
          <Figure label="recibidas" value={received ?? 0} />
          <Figure label="con caravana" value={caravans} tone={caravans > 0 ? 'success' : undefined} />
          <Figure label="sin caravana" value={withoutCaravan} />
          <Figure label="con lesión" value={rows.counts.injured} tone={rows.counts.injured > 0 ? 'warning' : undefined} />
        </Stack>
      </Paper>

      {reception.headerError && (
        <Alert severity="error" sx={{ borderRadius: '6px' }}>
          {reception.headerError}
        </Alert>
      )}
    </Stack>
  );
};

export default FullReceptionSidebar;

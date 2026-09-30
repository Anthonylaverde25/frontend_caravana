import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { periodOf } from '../birthOrderFormat';
import type { BirthFormMode, BirthOrderStart } from '../start/birthOrderStart';

interface BirthOrderSummaryCardProps {
  mode: BirthFormMode;
  start: BirthOrderStart;
  /** Batches the females are in now. */
  batches: string[];
  onEdit: () => void;
}

const Fact: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{value}</Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    )}
  </Box>
);

/**
 * What the start dialog declared about the order as a whole, read-only. Changing it means going back
 * to the dialog ("Editar"), so the confirmation never repeats those fields.
 */
export const BirthOrderSummaryCard: React.FC<BirthOrderSummaryCardProps> = ({ mode, start, batches, onEdit }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
        <Fact label="Vientres" value={`${start.motherIds.length}`} hint={`De ${batches.length} lote(s): ${batches.join(', ')}`} />
        <Fact label="Destino de las crías" value="Lote de su madre" hint="Se toma el día del parto" />
        {mode === 'order' && (
          <Fact label="Período" value={periodOf({ period_start: start.header.periodStart || null, period_end: start.header.periodEnd || null })} />
        )}
        <Fact label="Responsable" value={start.header.responsable.trim() || 'Sin indicar'} />
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={onEdit}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', flexShrink: 0 }}
      >
        Editar
      </Button>
    </Stack>
    {start.header.observations.trim() && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {start.header.observations.trim()}
      </Typography>
    )}
  </Paper>
);

export default BirthOrderSummaryCard;

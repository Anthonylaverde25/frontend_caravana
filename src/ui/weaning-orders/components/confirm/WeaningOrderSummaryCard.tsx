import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WEANING_TYPE_LABELS } from '@/features/weaning-orders/types';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';
import { managementLabel, WeaningBatchOption } from '../start/WeaningBatchSelectField';

interface WeaningOrderSummaryCardProps {
  form: WeaningOrderFormState;
  batchesById: Map<number, WeaningBatchOption>;
  /** Rodeos the calves come from. */
  rodeos: string[];
  onEdit: () => void;
}

const CATEGORY_TEXT = { KEEP: 'No cambia', DECLARED: 'Se declara ahora', AT_CHUTE: 'Se decide en la manga' } as const;

const formatDate = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—');

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
 * What the start dialog declared about the order as a whole, read-only. Changing it means going
 * back to the dialog ("Editar"), so the confirmation never repeats those fields.
 */
export const WeaningOrderSummaryCard: React.FC<WeaningOrderSummaryCardProps> = ({ form, batchesById, rodeos, onEdit }) => {
  const register = form.mode === 'register';
  const single = form.destinationMode === 'single';
  const destination = form.activeDestinations[0];
  const batch = destination?.batchId != null ? batchesById.get(destination.batchId) : undefined;

  const destinationValue = single
    ? destination?.kind === 'new'
      ? destination.name
      : (batch?.name ?? '—')
    : form.activeDestinations.length === 0
      ? 'Un lote por cría · en la manga'
      : `Un lote por cría · ${form.activeDestinations.length} lote(s)`;
  const destinationHint = single
    ? destination?.kind === 'new'
      ? 'Se crea al destetar'
      : `Manejo: ${managementLabel(batch?.is_confined)}`
    : undefined;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', xl: 'repeat(6, minmax(0, 1fr))' },
            gap: 2
          }}
        >
          <Fact label="Crías" value={`${form.calfIds.length}`} hint={`De ${rodeos.length} rodeo(s): ${rodeos.join(', ')}`} />
          <Fact label="Lote de destete" value={destinationValue} hint={destinationHint} />
          <Fact
            label="Tipo"
            value={form.header.weaningType ? WEANING_TYPE_LABELS[form.header.weaningType] : register ? 'Sin declarar' : 'Se marca en la manga'}
          />
          <Fact label="Categoría" value={CATEGORY_TEXT[form.categoryMode]} />
          <Fact label={register ? 'Destetado el' : 'Fecha planificada'} value={formatDate(form.header.weaningDate)} />
          <Fact label="Responsable" value={form.header.responsable.trim() || 'Sin indicar'} />
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
      {form.header.observations.trim() && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {form.header.observations.trim()}
        </Typography>
      )}
    </Paper>
  );
};

export default WeaningOrderSummaryCard;

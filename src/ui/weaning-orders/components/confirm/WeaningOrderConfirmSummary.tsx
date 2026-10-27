import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WEANING_TYPE_LABELS } from '@/features/weaning-orders/types';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';

/** One declared destination and how many calves the order sends to it. */
export interface ConfirmDestinationLine {
  key: string;
  label: string;
  kind: 'existing' | 'new' | 'stay';
  count: number;
}

interface WeaningOrderConfirmSummaryProps {
  form: WeaningOrderFormState;
  males: number;
  females: number;
  /** Rodeos the calves come from. */
  rodeos: string[];
  destinations: ConfirmDestinationLine[];
  /** Calves of a batch per calf left without one: their batch is written at the chute. */
  atChuteCount: number;
  /** A weaning that already happened: calves with a weight typed. */
  weighedCount: number;
  /** "Registrar destetadas": the open order these calves are weaned with. */
  sourceCode: string | null;
  /** Calves of that order still pending after these. */
  remainingCount: number;
}

const CATEGORY_TEXT = { KEEP: 'No cambia', DECLARED: 'Se declara ahora', AT_CHUTE: 'Se decide en la manga' } as const;

const formatDate = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—');

const Fact: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
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

const Consequence: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <Stack direction="row" spacing={1} alignItems="flex-start">
    <Box sx={{ color: 'primary.main', display: 'flex', mt: '2px' }}>
      <FuseSvgIcon size={16}>{icon}</FuseSvgIcon>
    </Box>
    <Typography variant="body2">{children}</Typography>
  </Stack>
);

/**
 * What the order is about to say, read-only: its calves, where each batch of them goes and how, and
 * what happens once it is issued — or, for a weaning that already happened, once it is registered.
 * Changing any of it is done back on the start dialog.
 */
export const WeaningOrderConfirmSummary: React.FC<WeaningOrderConfirmSummaryProps> = ({
  form,
  males,
  females,
  rodeos,
  destinations,
  atChuteCount,
  weighedCount,
  sourceCode,
  remainingCount
}) => {
  const register = form.mode === 'register';
  const single = form.destinationMode === 'single';
  const unweighed = form.calfIds.length - weighedCount;
  // A registered weaning already happened: no "al ejecutar", it is done when it is registered.
  const when = register ? '' : 'Al ejecutar, ';
  const moved = destinations.filter((d) => d.kind === 'existing' && d.count > 0);
  const created = destinations.filter((d) => d.kind === 'new' && d.count > 0);
  const staying = destinations.find((d) => d.kind === 'stay')?.count ?? 0;

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Fact label="Crías" value={`${form.calfIds.length} · ♂ ${males} · ♀ ${females}`} hint={rodeos.join(', ')} />
        <Fact label={register ? 'Destetado el' : 'Fecha planificada'} value={formatDate(form.header.weaningDate)} />
        <Fact label="Responsable" value={form.header.responsable.trim() || 'Sin indicar'} />
        <Fact
          label="Tipo de destete"
          value={form.header.weaningType ? WEANING_TYPE_LABELS[form.header.weaningType] : register ? 'Sin declarar' : 'Se marca en la manga'}
        />
        <Fact label="Categoría" value={CATEGORY_TEXT[form.categoryMode]} />
        <Fact label="Destino" value={single ? (destinations[0]?.label ?? '—') : 'Un lote por cría'} />
      </Box>

      {!single && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
            Reparto de las crías
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {destinations.map((d) => (
              <Chip key={d.key} size="small" label={`${d.label} · ${d.count}`} sx={{ fontWeight: 600 }} />
            ))}
            {atChuteCount > 0 && <Chip size="small" variant="outlined" label={`Se decide en la manga · ${atChuteCount}`} />}
          </Stack>
        </Box>
      )}

      <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
          Qué va a pasar
        </Typography>
        <Stack spacing={0.75}>
          {register && (
            <Consequence icon="heroicons-outline:check-badge">
              {sourceCode
                ? `Se ejecuta la orden ${sourceCode} con estas ${form.calfIds.length} cría(s), el ${formatDate(form.header.weaningDate)}: ${
                    remainingCount > 0 ? `${remainingCount} cría(s) de la orden siguen pendientes.` : 'la orden queda completa.'
                  }`
                : `La orden se crea ya ejecutada, con fecha ${formatDate(form.header.weaningDate)}: no queda nada pendiente.`}
            </Consequence>
          )}
          {staying > 0 && (
            <Consequence icon="heroicons-outline:home">
              {staying} cría(s) se destetan sin moverse: siguen en su lote actual.
            </Consequence>
          )}
          {moved.map((d) => (
            <Consequence key={d.key} icon="heroicons-outline:arrows-right-left">
              {when}
              {d.count} cría(s) pasan al lote <strong>{d.label}</strong>.
            </Consequence>
          ))}
          {created.map((d) => (
            <Consequence key={d.key} icon="heroicons-outline:plus-circle">
              {register ? 'Se crea' : 'Al ejecutar se crea'} el lote <strong>{d.label}</strong> con {d.count} cría(s).
            </Consequence>
          ))}
          {register && weighedCount > 0 && (
            <Consequence icon="heroicons-outline:scale">{weighedCount} peso(s) quedan registrados como peso de destete.</Consequence>
          )}
          {register && unweighed > 0 && (
            <Consequence icon="heroicons-outline:scale">{unweighed} cría(s) sin peso: conservan el último registrado.</Consequence>
          )}
          {!register && atChuteCount > 0 && (
            <Consequence icon="heroicons-outline:pencil">{atChuteCount} cría(s) sin lote: se anota en la manga, en la planilla DEST-01.</Consequence>
          )}
          {!register && !form.header.weaningType && (
            <Consequence icon="heroicons-outline:pencil">El tipo de destete se marca en la manga (casillero en blanco en la DEST-01).</Consequence>
          )}
          {!register && (
            <Consequence icon="heroicons-outline:document-text">
              La orden se cumple en la manga con la planilla DEST-01, o desde la bandeja con "Ejecutar orden".
            </Consequence>
          )}
        </Stack>
      </Box>

      {form.header.observations.trim() && (
        <Typography variant="body2" color="text.secondary">
          {form.header.observations.trim()}
        </Typography>
      )}
    </Stack>
  );
};

export default WeaningOrderConfirmSummary;

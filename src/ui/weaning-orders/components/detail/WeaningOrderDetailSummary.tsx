import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { WeaningOrder } from '@/features/weaning-orders/types';
import { formatDate, formatDateTime, managementLabel } from '../weaningOrderFormat';

const Kpi: React.FC<{ label: string; value: number; tone?: string }> = ({ label, value, tone }) => (
  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: '8px', flex: 1, minWidth: 96 }}>
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.64rem' }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: tone ?? 'text.primary', lineHeight: 1.2 }}>{value}</Typography>
  </Paper>
);

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  </Box>
);

/** The figures of the weaning order, where its calves come from and go to, and its dates. */
export const WeaningOrderDetailSummary: React.FC<{ order: WeaningOrder }> = ({ order }) => (
  <Stack spacing={2}>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Kpi label="Ordenadas" value={order.planned_head_count} />
      <Kpi label="Destetadas" value={order.weaned_head_count} tone="success.main" />
      <Kpi label="Pendientes" value={order.pending_head_count} tone={order.pending_head_count > 0 ? 'warning.main' : undefined} />
      <Kpi label="No destetadas" value={order.skipped_head_count} />
    </Stack>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
      <Fact label="Rodeo(s) de origen">
        {order.source_batches.length === 0
          ? 'Sin lote'
          : order.source_batches.map((b) => `${b.name ?? `Lote ${b.id}`} (${b.head_count})`).join(', ')}
      </Fact>
      <Fact label="Actividad de destino">{order.destination_activity.name ?? '—'}</Fact>
      <Fact label="Destino">{order.destination_mode === 'single' ? 'Un lote de destete para todas' : 'Lote de destete por cría'}</Fact>
      <Fact label="Categoría">{order.category_mode_label}</Fact>
      <Fact label="Tipo de destete">{order.weaning_type_label ?? 'Sin declarar (se marca en la manga)'}</Fact>
      <Fact label={order.kind === 'REGISTERED' ? 'Fecha del destete' : 'Fecha planificada'}>{formatDate(order.weaning_date)}</Fact>
      {order.kind === 'REGISTERED' ? (
        <Fact label="Registrado después del hecho">
          {formatDateTime(order.created_at)}
          {order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}
        </Fact>
      ) : (
        <Fact label="Emitida">
          {formatDateTime(order.emitted_at)}
          {order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}
        </Fact>
      )}
      {order.kind !== 'REGISTERED' && (
        <Fact label="Papel">{order.printed_at ? `Impresa ${formatDateTime(order.printed_at)}` : 'Nunca se imprimió'}</Fact>
      )}
      {order.first_executed_at && <Fact label="Primera ejecución">{formatDateTime(order.first_executed_at)}</Fact>}
      {order.closed_at && <Fact label="Cerrada">{formatDateTime(order.closed_at)}</Fact>}
      {order.responsable && <Fact label="Responsable">{order.responsable}</Fact>}
      {order.closing_reason && <Fact label="Motivo de cierre">{order.closing_reason}</Fact>}
    </Box>

    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Lotes de destete ({order.destinations.length})
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {order.destinations.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Ninguno declarado: el lote de cada cría se decide en la manga.
          </Typography>
        )}
        {order.destinations.map((destination) => (
          <Paper key={destination.id} variant="outlined" sx={{ p: 1.25, borderRadius: '8px' }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {destination.label}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={destination.target_batch_id ? 'Existente' : 'A crear'}
                sx={{ fontWeight: 700, height: 20 }}
              />
              <Typography variant="caption" color="text.secondary">
                {managementLabel(destination.management_is_confined)}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {destination.weaned_head_count} / {destination.planned_head_count} crías
              </Typography>
            </Stack>
            {destination.resolved_batch_name && !destination.target_batch_id && (
              <Typography variant="caption" color="text.secondary">
                Creado como lote «{destination.resolved_batch_name}»: las tandas siguientes van a ese lote.
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  </Stack>
);

export default WeaningOrderDetailSummary;

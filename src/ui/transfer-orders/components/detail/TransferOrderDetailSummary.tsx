import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { TransferOrder } from '@/features/transfer-orders/types';
import { formatDate, formatDateTime } from '../transferOrderFormat';

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

const management = (value: boolean | null): string =>
  value === true ? 'Corral' : value === false ? 'Pastura' : 'Sin declarar';

/** The figures of the order, what it moves where, and its dates — paper included. */
export const TransferOrderDetailSummary: React.FC<{ order: TransferOrder }> = ({ order }) => (
  <Stack spacing={2}>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Kpi label="Ordenadas" value={order.planned_head_count} />
      <Kpi label="Movidas" value={order.moved_head_count} tone="success.main" />
      <Kpi label="Pendientes" value={order.pending_head_count} tone={order.pending_head_count > 0 ? 'warning.main' : undefined} />
      <Kpi label="No viajaron" value={order.skipped_head_count} />
    </Stack>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
      <Fact label="Origen">
        {order.source_batch.name} ({order.source_activity_name ?? '—'})
      </Fact>
      <Fact label="Actividad de destino">{order.destination_activity.name}</Fact>
      <Fact label="Modo">{order.destination_mode === 'single' ? 'Un destino para todos' : 'Destino por animal'}</Fact>
      <Fact label="Fecha del movimiento">{formatDate(order.movement_date)}</Fact>
      {order.kind === 'REGISTERED' ? (
        <Fact label="Registrada después del hecho">
          {formatDateTime(order.created_at)}
          {order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}
        </Fact>
      ) : (
        <Fact label="Emitida">
          {formatDateTime(order.emitted_at)}
          {order.requested_by?.name ? ` · ${order.requested_by.name}` : ''}
        </Fact>
      )}
      {/* A registered order never went to the chute on paper: there is nothing to say about it. */}
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
        Destinos ({order.destinations.length})
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {order.destinations.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Ninguno declarado: el lote de cada animal se decide en la manga.
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
                {management(destination.management_is_confined)}
                {destination.new_batch_type_name ? ` · ${destination.new_batch_type_name}` : ''}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {destination.moved_head_count} / {destination.planned_head_count} cab.
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

export default TransferOrderDetailSummary;

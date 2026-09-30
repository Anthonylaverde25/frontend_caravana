import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { BirthOrder } from '@/features/birth-orders/types';
import { formatDateTime, periodOf, sourcesOf } from '../birthOrderFormat';

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

/** The figures of the birth order, where its females are, and its dates. */
export const BirthOrderDetailSummary: React.FC<{ order: BirthOrder }> = ({ order }) => (
  <Stack spacing={2}>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Kpi label="Vientres" value={order.head_count} />
      <Kpi label="Parieron" value={order.born_head_count} tone="success.main" />
      <Kpi label="Nac. muertos" value={order.stillborn_head_count} tone={order.stillborn_head_count > 0 ? 'error.main' : undefined} />
      <Kpi label="Abortos" value={order.abortion_head_count} tone={order.abortion_head_count > 0 ? 'error.main' : undefined} />
      <Kpi label="Pendientes" value={order.pending_head_count} tone={order.pending_head_count > 0 ? 'warning.main' : undefined} />
    </Stack>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
      <Fact label="Lote(s) de los vientres">{sourcesOf(order)}</Fact>
      <Fact label="Destino de las crías">En el lote de su madre, el día que nacen</Fact>
      <Fact label="Período de parición">{periodOf(order)}</Fact>
      {order.unplanned_head_count > 0 && <Fact label="Partos fuera de la orden">{order.unplanned_head_count}</Fact>}
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
      {order.kind !== 'REGISTERED' && (
        <Fact label="Papel">{order.printed_at ? `Impresa ${formatDateTime(order.printed_at)}` : 'Nunca se imprimió'}</Fact>
      )}
      {order.first_executed_at && <Fact label="Primera recorrida registrada">{formatDateTime(order.first_executed_at)}</Fact>}
      {order.closed_at && <Fact label="Cerrada">{formatDateTime(order.closed_at)}</Fact>}
      {order.responsable && <Fact label="Responsable">{order.responsable}</Fact>}
      {order.closing_reason && <Fact label="Motivo de cierre">{order.closing_reason}</Fact>}
    </Box>

    {order.observations && (
      <Typography variant="body2" color="text.secondary">
        {order.observations}
      </Typography>
    )}
  </Stack>
);

export default BirthOrderDetailSummary;

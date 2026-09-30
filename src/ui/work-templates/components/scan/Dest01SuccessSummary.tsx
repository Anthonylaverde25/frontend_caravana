import React from 'react';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import type { WeaningResult } from '@/features/weaning-orders/types';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import ScanCact01Warnings from './ScanCact01Warnings';

const Line: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{ fontWeight: 800, textAlign: 'right' }}>
      {children}
    </Typography>
  </Box>
);

/**
 * What a DEST-01 load did: the order it fulfilled (or created, for a sheet printed blank — whose
 * code is then to be written on the paper), the weaning batches that received the calves, and the
 * calves themselves.
 */
export const Dest01SuccessSummary: React.FC<{ result: WeaningResult }> = ({ result }) => {
  const order = result.weaning_order;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="success" sx={{ borderRadius: '6px' }}>
        Se destetaron <strong>{result.calves_count}</strong> cría(s) en{' '}
        {result.destinations.length === 1 ? (
          <>
            el lote de destete <strong>{result.destinations[0].batch_name}</strong>
            {result.destinations[0].created ? ', creado en esta carga' : ''}
          </>
        ) : (
          <>{result.destinations.length} lotes de destete</>
        )}
        .
      </Alert>

      {order && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{order.code}</Typography>
            <TransferOrderStatusChip status={order.status} />
            <Typography variant="body2" color="text.secondary">
              {order.weaned_head_count} de {order.planned_head_count} crías destetadas
              {order.pending_head_count > 0 ? ` · faltan ${order.pending_head_count}` : ''}
            </Typography>
          </Stack>
          {order.created_from_sheet && (
            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1, fontWeight: 700 }}>
              La planilla no traía orden: se creó la {order.code}. Anotá el código en el papel.
            </Typography>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
        <Stack spacing={1.2}>
          {result.destinations.map((destination) => (
            <Line key={destination.batch_id} label={`Lote ${destination.batch_name}${destination.created ? ' (nuevo)' : ''}:`}>
              {destination.count} cría(s)
            </Line>
          ))}
          <Line label="Crías destetadas:">
            {result.calves_count} ({result.males_count} machos · {result.females_count} hembras)
          </Line>
          <Line label="Crías pesadas:">{result.weighed_count}</Line>
          <Line label="Peso promedio de las pesadas:">{result.average_weight != null ? `${result.average_weight} kg` : '—'}</Line>
        </Stack>
      </Paper>

      {/* Already seen on the review screen; kept here as the record of what was confirmed. */}
      <ScanCact01Warnings warnings={result.warnings ?? []} />
    </Box>
  );
};

export default Dest01SuccessSummary;

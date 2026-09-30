import React from 'react';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import type { BirthResult } from '@/features/birth-orders/types';

const Figure: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: '8px', flex: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.64rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 800 }}>
      {value}
    </Typography>
  </Paper>
);

/** What a PAR-01 round registered, and where its order stands. */
export const Par01SuccessSummary: React.FC<{ result: BirthResult }> = ({ result }) => {
  const order = result.birth_order;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2">
        Se registraron <strong>{result.live_count}</strong> parto(s) con cría viva ({result.males_count} M · {result.females_count} H)
        {result.stillborn_count > 0 ? `, ${result.stillborn_count} nacido(s) muerto(s)` : ''}
        {result.abortion_count > 0 ? ` y ${result.abortion_count} aborto(s)` : ''}. Cada cría quedó en el lote de su madre.
      </Typography>
      <Stack direction="row" spacing={1}>
        <Figure label="Orden" value={order.code} />
        <Figure label="Estado" value={order.status_label} />
        <Figure label="Pendientes" value={order.pending_head_count} />
      </Stack>
      {order.created_from_sheet && (
        <Alert severity="info" sx={{ borderRadius: '6px' }}>
          La planilla no traía orden: se creó la orden registrada <strong>{order.code}</strong>. Escribí ese código en el papel.
        </Alert>
      )}
      {result.warnings.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: '6px' }}>
          {result.warnings.slice(0, 5).map((w) => (
            <div key={`${w.code}-${w.message}`}>{w.message}</div>
          ))}
        </Alert>
      )}
    </Box>
  );
};

export default Par01SuccessSummary;

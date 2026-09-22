import React from 'react';
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import ScanCact01Warnings from './ScanCact01Warnings';
import type { Cact01SuccessResult } from './types';

interface Cact01SuccessSummaryProps {
  result: Cact01SuccessResult;
}

const kg = (value: number | null | undefined): string =>
  value == null ? '—' : `${Math.round(value)} kg`;

const average = (value: number | null | undefined): string =>
  value == null ? '—' : `${value.toFixed(1)} kg`;

/**
 * What the load left behind, per batch.
 *
 * The source batch is shown before and after on purpose: the head count drops because
 * animals left, while the average may move in either direction without any animal
 * gaining or losing a kilo. Showing both numbers is what keeps somebody from reading a
 * compositional shift as a productive one.
 */
export const Cact01SuccessSummary: React.FC<Cact01SuccessSummaryProps> = ({ result }) => {
  const moved = result.destinations.reduce((sum, destination) => sum + destination.count, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="success" sx={{ borderRadius: '6px' }}>
        Se movieron <strong>{moved}</strong> animal(es) desde <strong>{result.source.before.batch_name}</strong> a{' '}
        <strong>{result.destinations.length}</strong> lote(s) de destino
        {result.source.weighed_in_sheet > 0
          ? `, con ${result.source.weighed_in_sheet} pesaje(s) registrado(s) antes del movimiento.`
          : '. La planilla no traía pesos, así que no se registró ningún pesaje.'}
      </Alert>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
          Lote de origen
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            variant="outlined"
            label={`Cabezas: ${result.source.before.count ?? '—'} → ${result.source.after.count ?? '—'}`}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Kilos: ${kg(result.source.before.total_weight)} → ${kg(result.source.after.total_weight)}`}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Promedio: ${average(result.source.before.average_weight)} → ${average(result.source.after.average_weight)}`}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          El promedio puede subir o bajar sin que ningún animal haya cambiado de peso: depende de cuáles se fueron.
          La curva del lote separa el pesaje del movimiento.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
          Lotes de destino
        </Typography>
        <Stack spacing={1.2} sx={{ mt: 1 }}>
          {result.destinations.map((destination) => (
            <Box
              key={destination.batch_id}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {destination.batch_name}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  {destination.created ? '(nuevo)' : '(existente)'}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {destination.count} cab. · prom. {average(destination.average_weight)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <ScanCact01Warnings warnings={result.warnings ?? []} />
    </Box>
  );
};

export default Cact01SuccessSummary;

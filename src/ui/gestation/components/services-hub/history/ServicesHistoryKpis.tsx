import { useMemo } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServicesHistoryKpisProps {
  /** Orders of the history only: diagnosed, rejected or cancelled. */
  orders: ServiceOrder[];
}

interface Kpi {
  title: string;
  value: string;
  caption: string;
  color: string;
}

/**
 * Results of the closed orders. The pregnancy rate is weighted over all of them (pregnant over
 * pregnant + empty), never an average of each order's rate.
 */
export default function ServicesHistoryKpis({ orders }: ServicesHistoryKpisProps) {
  const kpis = useMemo<Kpi[]>(() => {
    const diagnosed = orders.filter((o) => o.status === 'SUCCESS');
    const rejected = orders.filter((o) => o.status === 'REJECTED').length;
    const pregnant = diagnosed.reduce((sum, o) => sum + (o.diagnosis_summary?.pregnant ?? 0), 0);
    const empty = diagnosed.reduce((sum, o) => sum + (o.diagnosis_summary?.empty ?? 0), 0);
    const rate = pregnant + empty > 0 ? (pregnant * 100) / (pregnant + empty) : null;
    const best = diagnosed
      .filter((o) => o.final_pregnancy_rate !== null && o.final_pregnancy_rate !== undefined)
      .sort((a, b) => (b.final_pregnancy_rate ?? 0) - (a.final_pregnancy_rate ?? 0))[0];

    return [
      {
        title: 'Órdenes cerradas',
        value: String(diagnosed.length),
        caption: `con su diagnóstico · ${rejected} rechazada${rejected === 1 ? '' : 's'}`,
        color: 'text.secondary',
      },
      {
        title: 'Preñez final ponderada',
        value: rate !== null ? `${rate.toFixed(1)}%` : '—',
        caption: `${pregnant} de ${pregnant + empty} diagnosticadas`,
        color: 'success.main',
      },
      {
        title: 'Mejor orden',
        value: best ? `${best.final_pregnancy_rate!.toFixed(1)}%` : '—',
        caption: best ? `${best.code} · ${best.batch_name ?? `Lote #${best.batch_id}`}` : 'sin órdenes diagnosticadas',
        color: 'info.main',
      },
    ];
  }, [orders]);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
      {kpis.map((kpi) => (
        <Paper key={kpi.title} elevation={0} sx={{ p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', minHeight: 88 }}>
          <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            {kpi.title}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {kpi.value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {kpi.caption}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { WEANING_DEVIATION_LABELS, WeaningDeviationKind } from '@/features/weaning-orders/types';
import { KpiCard } from '@/ui/gestation/components/births/BirthsKpiStrip';
import { DeviationOrderGroup, daysAgo } from './deviationRows';

interface DeviationsKpiStripProps {
  groups: DeviationOrderGroup[];
  periodLabel: string;
}

/** How much the weanings strayed from their orders in the period, and how much is left to review. */
export const DeviationsKpiStrip: React.FC<DeviationsKpiStripProps> = ({ groups, periodLabel }) => {
  const metrics = useMemo(() => {
    const rows = groups.flatMap((g) => g.rows);
    const pending = rows.filter((r) => !r.reviewed);
    const byKind = new Map<WeaningDeviationKind, number>();
    rows.forEach((r) => byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1));
    const top = Math.max(0, ...byKind.values());
    const frequent = [...byKind.entries()].filter(([, count]) => count === top && top > 0).map(([kind]) => WEANING_DEVIATION_LABELS[kind]);
    const oldest = pending.reduce<string | null>((min, r) => (min === null || r.occurredAt < min ? r.occurredAt : min), null);

    return {
      total: rows.length,
      pending: pending.length,
      oldest: oldest ? daysAgo(oldest) : null,
      frequent,
      top,
      calves: new Set(rows.flatMap((r) => r.caravanIds)).size,
      orders: groups.length
    };
  }, [groups]);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
      <KpiCard title="Desvíos" value={metrics.total} caption={periodLabel} />
      <KpiCard
        title="Sin revisar"
        color="warning.dark"
        value={metrics.pending}
        caption={metrics.oldest !== null ? `el más antiguo, hace ${metrics.oldest} d` : 'todo revisado'}
      />
      <KpiCard
        title="Más frecuente"
        color="info.main"
        value={metrics.frequent.length > 0 ? metrics.frequent.join(' · ') : '—'}
        caption={metrics.top > 0 ? (metrics.frequent.length > 1 ? `${metrics.top} cada uno` : `${metrics.top}`) : 'sin desvíos'}
      />
      <KpiCard title="Crías afectadas" value={metrics.calves} caption={`en ${metrics.orders} ${metrics.orders === 1 ? 'orden' : 'órdenes'}`} />
    </Box>
  );
};

export default DeviationsKpiStrip;

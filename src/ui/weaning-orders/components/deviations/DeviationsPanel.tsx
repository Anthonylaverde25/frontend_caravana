import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { useWeaningDeviations } from '@/features/weaning-orders/hooks/useWeaningDeviations';
import { WEANING_DEVIATION_KINDS, WeaningDeviationKind } from '@/features/weaning-orders/types';
import { DeviationOrderGroup, DeviationRow, PeriodFilter, ReviewFilter, groupDeviations, withinPeriod } from './deviationRows';
import DeviationsKpiStrip from './DeviationsKpiStrip';
import DeviationsFilterBar, { PERIOD_LABELS } from './DeviationsFilterBar';
import DeviationsTable from './DeviationsTable';
import ReviewDeviationsDialog from './ReviewDeviationsDialog';

interface DeviationsPanelProps {
  /** `?orderCode=`: only that order's deviations, as the drawer's "Ver desvíos" opens them. */
  orderCode: string | null;
  onClearOrder: () => void;
  onOpenOrder: (orderId: number) => void;
}

/**
 * "Desvíos": what the weanings did differently from their orders, calf by calf, and its review.
 * Nothing here blocks or changes an order; it is read, then reviewed with a note.
 */
export const DeviationsPanel: React.FC<DeviationsPanelProps> = ({ orderCode, onClearOrder, onOpenOrder }) => {
  const theme = useTheme();
  const active = theme.palette.mode === 'dark' ? '#60a5fa' : '#0a6ed1';
  const { data: deviations = [], isLoading, isError } = useWeaningDeviations();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('30');
  const [kind, setKind] = useState<WeaningDeviationKind | 'ALL'>('ALL');
  const [review, setReview] = useState<ReviewFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reviewing, setReviewing] = useState<(DeviationRow & { orderCode: string })[]>([]);

  // The KPIs and the counts follow the period, the order and the search; kind and review narrow the table.
  const scoped = useMemo(() => {
    const term = search.trim().toLowerCase();

    return deviations.filter(
      (d) =>
        withinPeriod(d.occurred_at, period) &&
        (orderCode === null || d.order_code === orderCode) &&
        (term === '' || (d.identification ?? '').toLowerCase().includes(term) || (d.order_code ?? '').toLowerCase().includes(term))
    );
  }, [deviations, period, orderCode, search]);

  const scopedGroups = useMemo(() => groupDeviations(scoped), [scoped]);
  const scopedRows = scopedGroups.flatMap((g) => g.rows);

  const groups = useMemo<DeviationOrderGroup[]>(
    () =>
      scopedGroups
        .map((g) => {
          const rows = g.rows.filter(
            (r) => (kind === 'ALL' || r.kind === kind) && (review === 'all' || (review === 'pending' ? !r.reviewed : r.reviewed))
          );

          return { ...g, rows, pending: rows.filter((r) => !r.reviewed).length };
        })
        .filter((g) => g.rows.length > 0),
    [scopedGroups, kind, review]
  );

  const kindCounts = useMemo(() => {
    const counts = { ALL: scopedRows.length } as Record<WeaningDeviationKind | 'ALL', number>;
    WEANING_DEVIATION_KINDS.forEach((k) => (counts[k] = scopedRows.filter((r) => r.kind === k).length));

    return counts;
  }, [scopedRows]);

  const reviewCounts = {
    pending: scopedRows.filter((r) => !r.reviewed).length,
    reviewed: scopedRows.filter((r) => r.reviewed).length,
    all: scopedRows.length
  };

  const rowsByKey = useMemo(() => {
    const map = new Map<string, DeviationRow & { orderCode: string }>();
    groups.forEach((g) => g.rows.forEach((r) => map.set(r.key, { ...r, orderCode: g.code })));

    return map;
  }, [groups]);
  const chosen = [...selected].map((key) => rowsByKey.get(key)).filter((r): r is DeviationRow & { orderCode: string } => Boolean(r && !r.reviewed));

  const toggle = (row: DeviationRow) =>
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(row.key)) next.delete(row.key);
      else next.add(row.key);

      return next;
    });

  const toggleGroup = (group: DeviationOrderGroup) =>
    setSelected((prev) => {
      const open = group.rows.filter((r) => !r.reviewed).map((r) => r.key);
      const all = open.every((key) => prev.has(key));
      const next = new Set(prev);
      open.forEach((key) => (all ? next.delete(key) : next.add(key)));

      return next;
    });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: '6px' }}>
        No se pudieron cargar los desvíos.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <DeviationsKpiStrip groups={scopedGroups} periodLabel={PERIOD_LABELS[period].toLowerCase()} />

      <DeviationsFilterBar
        search={search}
        onSearch={setSearch}
        period={period}
        onPeriod={setPeriod}
        kind={kind}
        onKind={setKind}
        kindCounts={kindCounts}
        review={review}
        onReview={setReview}
        reviewCounts={reviewCounts}
        orderCode={orderCode}
        onClearOrder={onClearOrder}
      />

      {chosen.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            px: 2,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: alpha(active, 0.22),
            bgcolor: alpha(active, 0.05),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ px: 1.25, py: 0.5, borderRadius: '6px', bgcolor: alpha(active, 0.16), color: active, fontSize: '0.75rem', fontWeight: 800 }}>
            {chosen.length} {chosen.length === 1 ? 'desvío seleccionado' : 'desvíos seleccionados'}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {new Set(chosen.map((r) => r.orderCode)).size} orden(es) · {new Set(chosen.flatMap((r) => r.caravanIds)).size} cría(s)
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button size="small" onClick={() => setSelected(new Set())} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Limpiar
          </Button>
          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={() => setReviewing(chosen)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 32 }}
          >
            Revisar ({chosen.length})
          </Button>
        </Paper>
      )}

      {groups.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {deviations.length === 0 ? 'Ningún destete se apartó de su orden.' : 'Ningún desvío coincide con los filtros.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deviations.length === 0
              ? 'Cuando una cría vaya a otro destino, con otro tipo o categoría, tarde o no se desteta, aparece acá.'
              : 'Probá con otro período, tipo o estado de revisión.'}
          </Typography>
        </Paper>
      ) : (
        <DeviationsTable groups={groups} selected={selected} onToggle={toggle} onToggleGroup={toggleGroup} onOpenOrder={onOpenOrder} />
      )}

      <ReviewDeviationsDialog
        rows={reviewing}
        onClose={() => setReviewing([])}
        onDone={() => {
          setReviewing([]);
          setSelected(new Set());
        }}
      />
    </Stack>
  );
};

export default DeviationsPanel;

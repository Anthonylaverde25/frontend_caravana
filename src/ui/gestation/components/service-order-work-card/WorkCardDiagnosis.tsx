import { Box, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import type { ServiceOrderDiagnosisSummary } from '@/features/gestation/hooks/useServiceOrders';

interface WorkCardDiagnosisProps {
  summary: ServiceOrderDiagnosisSummary | null | undefined;
  /** Females of the order, used when there is no summary yet. */
  totalFemales: number;
}

const monoSx = { fontFamily: 'monospace' } as const;

/**
 * Compact diagnosis of a tray card: scanned over total, the bar, the verdict breakdown and the
 * partial rate. A provisional empty was scanned, so it counts as progress but stays out of the rate.
 */
export default function WorkCardDiagnosis({ summary, totalFemales }: WorkCardDiagnosisProps) {
  const total = summary?.total ?? totalFemales;
  const provisional = summary?.provisional_empty ?? 0;
  const scanned = (summary?.evaluated ?? 0) + provisional;
  const progress = total > 0 ? Math.round((scanned / total) * 100) : 0;
  const complete = total > 0 && (summary?.pending ?? 1) === 0;
  const rate = summary?.partial_rate;

  const breakdown =
    scanned === 0 || !summary
      ? 'Sin tactar'
      : `${summary.pregnant} preñadas · ${summary.empty} vacías${provisional ? ` · ${provisional} prov.` : ''}`;
  const excluded = summary
    ? [
        summary.not_diagnosed > 0 && `${summary.not_diagnosed} sin diagnóstico`,
        summary.exited > 0 && `${summary.exited} salidas`,
        provisional > 0 && `${provisional} vacía(s) provisoria(s)`,
      ].filter(Boolean)
    : [];

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>Tactados</Typography>
        <Typography sx={{ ...monoSx, fontSize: '0.8rem', color: 'text.secondary' }}>
          <Box component="b" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {scanned}
          </Box>{' '}
          / {total}
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={progress} color={complete ? 'success' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{breakdown}</Typography>
        <Tooltip title={excluded.length > 0 ? `Fuera de la tasa: ${excluded.join(', ')}` : ''}>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
            preñez{' '}
            <Box component="b" sx={{ ...monoSx, fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {rate !== null && rate !== undefined ? `${rate.toFixed(1)}%` : '—'}
            </Box>
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

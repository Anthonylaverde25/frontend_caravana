import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import type { ServiceOrderDiagnosisSummary } from '@/features/gestation/hooks/useServiceOrders';

interface DiagnosisProgressBarProps {
  summary: ServiceOrderDiagnosisSummary;
  /** The rate is final once the order is closed; partial before. */
  isClosed?: boolean;
  finalRate?: number | null;
}

/**
 * How far the diagnosis of an order is: scanned over total, the rate (pregnant over pregnant +
 * final empty) and what stays out of it. A provisional empty was scanned, so it counts as progress;
 * it is shown apart and stays out of the rate until it is final.
 */
export default function DiagnosisProgressBar({ summary, isClosed = false, finalRate = null }: DiagnosisProgressBarProps) {
  const scanned = summary.evaluated + summary.provisional_empty;
  const progress = summary.total > 0 ? Math.round((scanned / summary.total) * 100) : 0;
  const rate = isClosed ? finalRate : summary.partial_rate;
  const excluded = [
    summary.not_diagnosed > 0 && `${summary.not_diagnosed} sin diagnóstico`,
    summary.exited > 0 && `${summary.exited} salidas`,
    summary.provisional_empty > 0 && `${summary.provisional_empty} vacía(s) provisoria(s)`,
  ].filter(Boolean);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Diagnóstico de gestación
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          {scanned}/{summary.total} tactados
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={summary.pending === 0 ? 'success' : 'primary'}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
        {summary.pregnant} preñadas · {summary.empty} vacías
        {rate !== null && rate !== undefined && ` · preñez ${isClosed ? 'final' : 'parcial'} ${rate.toFixed(1)}%`}
        {summary.unchecked > 0 && ` · faltan ${summary.unchecked}`}
      </Typography>
      {excluded.length > 0 && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }}>
          Fuera de la tasa: {excluded.join(', ')}
        </Typography>
      )}
    </Box>
  );
}

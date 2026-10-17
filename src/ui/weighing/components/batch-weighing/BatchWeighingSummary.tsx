import { Chip, Stack, Typography } from '@mui/material';
import { CageGroupsSummary } from '@/core/weighing/domain/services/cageGroups';
import { BatchWeighingEntry } from '@/core/weighing/domain/entities/Weighing';

interface BatchWeighingSummaryProps {
  summary: CageGroupsSummary;
  batchHeads: number | null;
  entry?: BatchWeighingEntry;
}

const kg = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/**
 * One line: the average the animals will get, and whether the loads cover the batch. Without full
 * coverage the average cannot be assigned, because nobody recorded which animals went on.
 */
export function BatchWeighingSummary({ summary, batchHeads, entry }: BatchWeighingSummaryProps) {
  if (summary.heads === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 0.5 }}>
        {entry === 'AVERAGE'
          ? 'Indicá el peso promedio y cabezas para calcular la masa del lote.'
          : 'Cargá las jaulas para ver el promedio del lote.'}
      </Typography>
    );
  }

  const covered = batchHeads !== null && summary.missingHeads === 0;
  const status =
    batchHeads === null
      ? null
      : covered
        ? { label: 'Cubre el lote', color: 'success' as const }
        : summary.missingHeads > 0
          ? { label: `Faltan ${summary.missingHeads} cab.`, color: 'warning' as const }
          : { label: `Sobran ${-summary.missingHeads} cab.`, color: 'error' as const };

  return (
    <Stack direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
      <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {summary.average !== null ? kg(summary.average) : '—'}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        kg/cab · {summary.heads}
        {batchHeads !== null ? ` de ${batchHeads}` : ''} cabezas · {kg(summary.netWeight)} kg
      </Typography>
      {status && <Chip size="small" label={status.label} color={status.color} variant="outlined" sx={{ fontWeight: 700 }} />}
    </Stack>
  );
}

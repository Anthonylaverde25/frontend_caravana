import { Chip, Stack, Typography } from '@mui/material';
import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';
import { CageGroupsSummary } from '@/core/weighing/domain/services/cageGroups';
import { categoryKey } from './batchWeighingFormModel';

interface BatchWeighingSummaryProps {
  loads: { category: BatchCategoryCount; summary: CageGroupsSummary }[];
}

const kg = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/**
 * One line per category: the average its animals will get, and whether its cages cover it. Without
 * full coverage the average cannot be assigned, because nobody recorded which animals went on. A
 * category with no cages keeps the weights of its animals.
 */
export function BatchWeighingSummary({ loads }: BatchWeighingSummaryProps) {
  if (loads.every(({ summary }) => summary.heads === 0)) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 0.5 }}>
        Cargá las jaulas para ver el promedio de cada categoría.
      </Typography>
    );
  }

  return (
    <Stack spacing={1} sx={{ pt: 0.5 }}>
      {loads.map(({ category, summary }) => {
        const name = category.name ?? 'Sin categoría';

        if (summary.heads === 0) {
          return (
            <Typography key={categoryKey(category)} variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {name} · conserva su peso
            </Typography>
          );
        }

        const status =
          summary.missingHeads === 0
            ? { label: 'Cubre la categoría', color: 'success' as const }
            : summary.missingHeads > 0
              ? { label: `Faltan ${summary.missingHeads} cab.`, color: 'warning' as const }
              : { label: `Sobran ${-summary.missingHeads} cab.`, color: 'error' as const };

        return (
          <Stack key={categoryKey(category)} direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {summary.average !== null ? kg(summary.average) : '—'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              kg/cab · {name} · {summary.heads} de {category.count} cabezas · {kg(summary.netWeight)} kg
            </Typography>
            <Chip size="small" label={status.label} color={status.color} variant="outlined" sx={{ fontWeight: 700 }} />
          </Stack>
        );
      })}
    </Stack>
  );
}

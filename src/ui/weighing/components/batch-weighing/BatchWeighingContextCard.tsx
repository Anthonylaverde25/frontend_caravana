import { Alert, Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';
import type { BatchWeighingEntry } from '@/core/weighing/domain/entities/Weighing';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';

interface BatchWeighingContextCardProps {
  batch: Batch;
  categories: BatchCategoryCount[];
  entry: BatchWeighingEntry;
}

/**
 * "1. Lote": which batch is weighed and who is in it. Whether it is homogeneous decides how far one
 * figure can speak for its animals, so a mixed batch says so before anything is typed.
 */
export function BatchWeighingContextCard({ batch, categories, entry }: BatchWeighingContextCardProps) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const mixed = categories.length > 1;
  const context = [batch.activity_name, batch.batch_type_name, batch.farm_name].filter(Boolean).join(' · ');

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>1. Lote</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <Stack spacing={0.25}>
          <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{batch.name}</Typography>
          {context && <Typography variant="caption" color="text.secondary">{context}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {total} cab. · {mixed ? `lote mezclado, ${categories.length} categorías` : 'lote homogéneo'}
          </Typography>
        </Stack>

        <Stack spacing={1}>
          {categories.map((category) => (
            <Box key={category.category_id ?? 'none'}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{category.name ?? 'Sin categoría'}</Typography>
                <Typography variant="caption" color="text.secondary">{category.count} cab.</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={(category.count / total) * 100} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
            </Box>
          ))}
        </Stack>

        {mixed && entry === 'BY_CATEGORY' && (
          <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
            Cargá un promedio por cada categoría que pesaste. La que quede vacía conserva el peso de sus animales.
          </Alert>
        )}
        {mixed && entry === 'LOADS' && (
          <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
            Indicá qué categoría subió a cada jaula. Si subieron mezcladas, ese peso no se puede repartir: pesalas por separado.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

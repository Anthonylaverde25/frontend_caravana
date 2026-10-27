import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { formatDay } from '../../utils/reproductiveVerdict';

interface InseminationOrderContextCardProps {
  order: ServiceOrder;
}

/** "1. Orden" of "Cargar inseminaciones", copied from the tacto's: what is served and how far it went. */
export default function InseminationOrderContextCard({ order }: InseminationOrderContextCardProps) {
  const { data: batch } = useBatch(order.batch_id);
  const summary = order.insemination_summary;
  const done = summary?.inseminated ?? 0;
  const total = summary?.females ?? order.female_caravan_ids.length;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>1. Orden</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <Stack spacing={0.25}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>{order.code} · IA</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {batch?.name ?? order.batch_name ?? `Lote #${order.batch_id}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Inicio {formatDay(order.actual_start_date ?? order.planned_start_date)}
            {summary?.repaso_bulls_active ? ` · ${summary.repaso_bulls_active} toro(s) de repaso en el lote` : ''}
          </Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {done} de {total} inseminadas
          </Typography>
          <LinearProgress variant="determinate" value={total > 0 ? (done * 100) / total : 0} sx={{ height: 6, borderRadius: 3 }} />
        </Stack>
      </Stack>
    </Paper>
  );
}

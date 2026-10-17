import { Paper, Stack, Typography } from '@mui/material';
import type { ServiceOrder, ServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import DiagnosisProgressBar from '../diagnosis-summary/DiagnosisProgressBar';
import ExposedFemalesTactoNotice from '../sanitary-exposure/ExposedFemalesTactoNotice';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';

interface TactoOrderContextCardProps {
  order: ServiceOrder;
  diagnosis: ServiceOrderDiagnosis;
}

/**
 * "1. Orden" of "Cargar tacto": what is being diagnosed, where the bulls are and how far the
 * diagnosis went. Read-only.
 */
export default function TactoOrderContextCard({ order, diagnosis }: TactoOrderContextCardProps) {
  const { data: batch } = useBatch(order.batch_id);
  const phase = getServiceOrderPhase(order);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>1. Orden</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <Stack spacing={0.25}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>{order.code}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {batch?.name ?? order.batch_name ?? `Lote #${order.batch_id}`}
            {batch?.farm_name && (
              <Typography component="span" variant="body2" color="text.secondary">
                {' '}
                · {batch.farm_name}
              </Typography>
            )}
          </Typography>
          {phase.detail && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {phase.label} · {phase.detail}
            </Typography>
          )}
        </Stack>
        <DiagnosisProgressBar summary={diagnosis.summary} />
        <ExposedFemalesTactoNotice femaleIds={order.female_caravan_ids} />
      </Stack>
    </Paper>
  );
}

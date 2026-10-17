import { Paper, Stack, Typography } from '@mui/material';
import { ServiceOrder, useServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import { formatDay } from '@/ui/gestation/utils/reproductiveVerdict';
import DiagnosisProgressBar from '../diagnosis-summary/DiagnosisProgressBar';
import ServiceOrderIncidentsPanel from '../diagnosis-summary/ServiceOrderIncidentsPanel';

interface ServiceOrderDiagnosisPanelProps {
  order: ServiceOrder | null;
}

/**
 * Diagnosis of the order in the drawer: progress, rate, rounds and incidents.
 */
export default function ServiceOrderDiagnosisPanel({ order }: ServiceOrderDiagnosisPanelProps) {
  const showsDiagnosis = order !== null && ['APPROVED', 'BULLS_WITHDRAWN', 'SUCCESS'].includes(order.status);
  const { data: diagnosis } = useServiceOrderDiagnosis(showsDiagnosis ? order?.id : null);

  if (!showsDiagnosis || !order?.diagnosis_summary) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '8px' }}>
      <Stack spacing={1.5}>
        <DiagnosisProgressBar
          summary={order.diagnosis_summary}
          isClosed={order.status === 'SUCCESS'}
          finalRate={order.final_pregnancy_rate ?? null}
        />
        {order.status === 'BULLS_WITHDRAWN' && order.suggested_diagnosis_date && (
          <Typography variant="caption" color="text.secondary">
            Toros retirados el {formatDay(order.actual_end_date)} · tacto sugerido desde el {formatDay(order.suggested_diagnosis_date)}
          </Typography>
        )}
        {order.status === 'SUCCESS' && order.diagnosis_completed_at && (
          <Typography variant="caption" color="text.secondary">
            Diagnóstico cerrado el {formatDay(order.diagnosis_completed_at)}
          </Typography>
        )}
        {diagnosis && diagnosis.rounds.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {diagnosis.rounds
              .map((round) => `Ronda ${round.number} · ${formatDay(round.round_date)}: ${round.diagnosed}${round.rechecks ? ` (${round.rechecks} re-tactos)` : ''}`)
              .join('  ·  ')}
          </Typography>
        )}
        {diagnosis && <ServiceOrderIncidentsPanel orderId={order.id} incidents={diagnosis.incidents} />}
      </Stack>
    </Paper>
  );
}

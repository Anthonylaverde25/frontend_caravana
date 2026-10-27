import { Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { isOpenStatus } from '@/ui/gestation/utils/serviceOrderStatus';

interface Rep01ImportOutcomeProps {
  serviceOrderId: number | null | undefined;
  result: { processed?: number; skipped?: number; errors?: unknown[]; order_status?: string | null; order_pending?: number | null } | null;
}

/**
 * After a scanned REP-01 is saved: the scan never closes the order. It tells how many females
 * still lack a verdict and offers to close the order when none is missing.
 */
export default function Rep01ImportOutcome({ serviceOrderId, result }: Rep01ImportOutcomeProps) {
  const navigate = useNavigate();
  if (!result || !serviceOrderId) return null;

  const open = isOpenStatus(result.order_status);
  const pending = result.order_pending ?? 0;
  const summary = `${result.processed ?? 0} diagnóstico(s) guardados, ${result.skipped ?? 0} en blanco (siguen pendientes), ${result.errors?.length ?? 0} con error.`;

  return (
    <Alert
      severity={pending === 0 && open ? 'success' : 'info'}
      sx={{ mx: 2, mb: 1, fontSize: '0.8rem' }}
      action={
        open ? (
          <Button size="small" onClick={() => navigate(`/gestation/tacto?closeOrder=${serviceOrderId}`)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {pending === 0 ? 'Cerrar orden ahora' : 'Completar y cerrar orden'}
          </Button>
        ) : undefined
      }
    >
      {summary} {open && (pending === 0 ? 'No falta ningún vientre.' : `Faltan ${pending} vientre(s) para cerrar la orden.`)}
    </Alert>
  );
}

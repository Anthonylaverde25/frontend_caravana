import { useLocation, useNavigate, useParams } from 'react-router';
import GestationListView from './GestationListView';
import RegisterBirthsDialog from '@/ui/birth-orders/components/register/RegisterBirthsDialog';
import type { RegisterBirthsEntryState } from '@/ui/birth-orders/components/register/registerBirths';

/**
 * `/gestation/list/:batchId/register-births`: "Registrar partos" of one batch, a full-screen dialog
 * over Monitoreo Gestacional. Closing it, or registering, goes back to where it was opened from.
 */
export default function RegisterBirthsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const batchId = Number(useParams<{ batchId: string }>().batchId) || null;
  const returnTo = (location.state as RegisterBirthsEntryState | null)?.returnTo ?? '/gestation/list';

  return (
    <>
      <GestationListView />
      <RegisterBirthsDialog
        key={batchId ?? 'all'}
        batchId={batchId}
        onClose={() => navigate(returnTo)}
        onDone={() => navigate(returnTo)}
      />
    </>
  );
}

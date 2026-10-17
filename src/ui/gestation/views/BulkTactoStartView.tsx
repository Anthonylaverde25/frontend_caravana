import { useLocation, useNavigate, useParams } from 'react-router';
import ServiceOrdersView from './ServiceOrdersView';
import TactoStartDialog from '../components/tacto-start/TactoStartDialog';
import { type TactoEntryState, defaultReturnTo } from '../components/tacto-start/tactoStart';

/**
 * `/gestation/service-orders/:orderId/bulk-tacto`: "Cargar tacto", a full-screen dialog over the
 * service orders list. Closing it goes back to where it was opened from.
 */
export default function BulkTactoStartView() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = Number(useParams<{ orderId: string }>().orderId);
  const state = (location.state ?? {}) as TactoEntryState;
  const returnTo = state.returnTo ?? defaultReturnTo(orderId);
  const mode = state.mode ?? 'round';

  return (
    <>
      <ServiceOrdersView />
      <TactoStartDialog key={`${orderId}-${mode}`} orderId={orderId} mode={mode} returnTo={returnTo} onClose={() => navigate(returnTo)} />
    </>
  );
}

import { useNavigate, useParams } from 'react-router';
import ServiceOrdersView from './ServiceOrdersView';
import InseminationEntryDialog from '../components/insemination-entry/InseminationEntryDialog';
import { diagnosisTrayPath } from '../components/tacto-start/tactoStart';

/**
 * `/gestation/service-orders/:orderId/inseminations`: "Cargar inseminaciones", a full-screen dialog
 * over the service orders list. Closing it goes to the tray, where the order is worked.
 */
export default function InseminationEntryView() {
  const navigate = useNavigate();
  const orderId = Number(useParams<{ orderId: string }>().orderId);

  return (
    <>
      <ServiceOrdersView />
      <InseminationEntryDialog key={orderId} orderId={orderId} onClose={() => navigate(diagnosisTrayPath(orderId))} />
    </>
  );
}

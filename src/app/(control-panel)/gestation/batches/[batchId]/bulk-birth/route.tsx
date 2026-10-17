import { Navigate, useParams } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * The old bulk birth entry. Every calving is registered with a birth order now: the link lands on
 * "Registrar partos" of the batch, over Monitoreo Gestacional.
 */
function BulkBirthRedirect() {
  const { batchId } = useParams<{ batchId: string }>();

  return <Navigate to={batchId ? `/gestation/list/${batchId}/register-births` : '/birth-orders/register'} replace />;
}

const route: FuseRouteItemType = {
  path: 'gestation/batches/:batchId/bulk-birth',
  element: <BulkBirthRedirect />
};

export default route;

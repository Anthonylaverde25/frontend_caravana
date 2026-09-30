import { Navigate, useParams } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * The old bulk birth entry. Every calving is registered with a birth order now: the link lands on
 * "Registrar partos" with the batch's pregnant females already chosen.
 */
function BulkBirthRedirect() {
  const { batchId } = useParams<{ batchId: string }>();

  return <Navigate to={`/birth-orders/register?batchId=${batchId ?? ''}`} replace />;
}

const route: FuseRouteItemType = {
  path: 'gestation/batches/:batchId/bulk-birth',
  element: <BulkBirthRedirect />
};

export default route;

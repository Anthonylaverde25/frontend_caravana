import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Former "Lotes de servicio" listing. A service is now an order started on an operational batch,
 * so the old address lands on the service orders board.
 */
const route: FuseRouteItemType = {
  path: 'gestation/service-batches',
  element: <Navigate to="/gestation/service-orders" replace />
};

export default route;

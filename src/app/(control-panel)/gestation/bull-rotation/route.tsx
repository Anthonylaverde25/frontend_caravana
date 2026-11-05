import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * This view was retired: orders are issued from Servicios. Earlier links land there.
 */
const route: FuseRouteItemType = {
  path: 'gestation/bull-rotation',
  element: <Navigate to="/gestation/services/conventional" replace />
};

export default route;

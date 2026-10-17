import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Gestation Dashboard has been integrated into the Reproductive Board on /dashboard.
 * Redirects seamlessly to /dashboard?board=sys_reproductive.
 */
const route: FuseRouteItemType = {
  path: 'gestation',
  element: <Navigate to="/dashboard?board=sys_reproductive" replace />
};

export default route;

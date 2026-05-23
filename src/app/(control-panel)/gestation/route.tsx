import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GestationDashboardView = lazy(() => import('src/ui/gestation/views/GestationDashboardView'));

/**
 * The Gestation Dashboard page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation',
  element: <GestationDashboardView />
};

export default route;

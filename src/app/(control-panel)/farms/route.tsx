import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const FarmsView = lazy(() => import('src/ui/farms/views/FarmsView'));

/**
 * The Farms page route.
 */
const route: FuseRouteItemType = {
  path: 'farms',
  element: <FarmsView />
};

export default route;

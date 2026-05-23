import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GestationListView = lazy(() => import('src/ui/gestation/views/GestationListView'));

/**
 * The Gestation List page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/list',
  element: <GestationListView />
};

export default route;

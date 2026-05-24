import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ServiceOrdersView = lazy(() => import('src/ui/gestation/views/ServiceOrdersView'));

/**
 * The Service Orders Listing page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/service-orders',
  element: <ServiceOrdersView />
};

export default route;

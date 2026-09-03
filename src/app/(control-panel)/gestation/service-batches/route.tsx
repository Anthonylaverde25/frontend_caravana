import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ServiceBatchesView = lazy(() => import('src/ui/gestation/views/ServiceBatchesView'));

/**
 * The Service Batches Listing and Management page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/service-batches',
  element: <ServiceBatchesView />
};

export default route;

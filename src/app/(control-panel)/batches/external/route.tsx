import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BatchesView = lazy(() => import('src/ui/batches/views/BatchesView'));

/**
 * The External Batches page route.
 */
const route: FuseRouteItemType = {
  path: 'batches/external',
  element: <BatchesView />
};

export default route;

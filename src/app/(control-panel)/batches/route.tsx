import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BatchesView = lazy(() => import('src/ui/batches/views/BatchesView'));

/**
 * The Batches page route.
 */
const route: FuseRouteItemType = {
  path: 'batches',
  element: <BatchesView />
};

export default route;

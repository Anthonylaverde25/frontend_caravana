import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ExternalBatchAssignmentView = lazy(() => import('src/ui/batches/views/ExternalBatchAssignmentView'));

/**
 * The External Batch Assignment page route.
 */
const route: FuseRouteItemType = {
  path: 'batches/external-assignment',
  element: <ExternalBatchAssignmentView />
};

export default route;

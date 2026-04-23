import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BulkCaravanEntryView = lazy(() => import('src/ui/batches/views/BulkCaravanEntryView'));

/**
 * The Bulk Caravan Entry page route.
 */
const route: FuseRouteItemType = {
  path: 'batches/:batchId/bulk-entry',
  element: <BulkCaravanEntryView />
};

export default route;

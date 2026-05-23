import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BulkBirthEntryView = lazy(() => import('src/ui/gestation/views/BulkBirthEntryView'));

/**
 * The Bulk Calving/Birth Entry page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/batches/:batchId/bulk-birth',
  element: <BulkBirthEntryView />
};

export default route;

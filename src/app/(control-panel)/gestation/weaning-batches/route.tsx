import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WeaningBatchesView = lazy(() => import('src/ui/gestation/views/WeaningBatchesView'));

/**
 * The Weaning Batches Listing and Management page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/weaning-batches',
  element: <WeaningBatchesView />
};

export default route;

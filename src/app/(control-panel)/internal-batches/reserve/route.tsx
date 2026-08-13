import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ReserveBatchView = lazy(() => import('src/ui/internal-batches/views/ReserveBatchView'));

/**
 * The System Reserve Batch page route.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/reserve',
	element: <ReserveBatchView />
};

export default route;

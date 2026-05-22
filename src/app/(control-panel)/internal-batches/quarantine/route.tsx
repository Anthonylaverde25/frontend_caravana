import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const QuarantineView = lazy(() => import('src/ui/internal-batches/views/QuarantineView'));

/**
 * The Quarantine Batches page route.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/quarantine',
	element: <QuarantineView />
};

export default route;

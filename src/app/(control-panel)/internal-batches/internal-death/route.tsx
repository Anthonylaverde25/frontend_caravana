import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const InternalDeathView = lazy(() => import('src/ui/internal-batches/views/InternalDeathView'));

/**
 * The Internal Death Batches page route.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/internal-death',
	element: <InternalDeathView />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const LivestockView = lazy(() => import('src/components/caravan/views/LivestockView'));

/**
 * The Livestock page route.
 */
const route: FuseRouteItemType = {
	path: 'livestock',
	element: <LivestockView />
};

export default route;

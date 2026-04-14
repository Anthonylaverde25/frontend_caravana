import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const RecordsView = lazy(() => import('./RecordsView'));

/**
 * The Livestock Records page route.
 */
const route: FuseRouteItemType = {
	path: 'livestock/records',
	element: <RecordsView />
};

export default route;

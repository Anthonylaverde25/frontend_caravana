import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const RecordsView = lazy(() => import('./RecordsView'));
const MovementsView = lazy(() => import('./CaravansMovements'));
const BulkWeightView = lazy(() => import('./BulkWeightView'));

/**
 * The Livestock Records page route.
 */
const route: FuseRouteItemType = {
	path: 'caravans',
	children: [
		{
			index: true,
			element: <RecordsView />
		},
		{
			path: 'movements',
			element: <MovementsView />
		},
		{
			path: 'bulk-weight/:batchId',
			element: <BulkWeightView />
		}
	]
};

export default route;

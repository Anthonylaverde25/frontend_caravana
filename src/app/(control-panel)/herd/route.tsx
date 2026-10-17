import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const HerdView = lazy(() => import('src/ui/herd/views/HerdView'));
const HerdBatchView = lazy(() => import('src/ui/herd/views/HerdBatchView'));
const MovementsView = lazy(() => import('../livestock/records/CaravansMovements'));
const BulkWeightView = lazy(() => import('../livestock/records/BulkWeightView'));
const WeightControlSheetView = lazy(() => import('../livestock/records/WeightControlSheetView'));

/**
 * Own herd: batches and their caravans in one view, plus the screens that work on a batch
 * (bulk weighing, control sheet) and the movement history. /caravans and /batches/own redirect here.
 */
const route: FuseRouteItemType = {
	path: 'herd',
	children: [
		{
			index: true,
			element: <HerdView />
		},
		{
			path: 'movements',
			element: <MovementsView />
		},
		{
			// A batch id, or "unassigned" for the caravans in no batch.
			path: 'batches/:batchId',
			element: <HerdBatchView />
		},
		{
			path: 'batches/:batchId/bulk-weight',
			element: <BulkWeightView />
		},
		{
			// One batch id, or several separated by commas (one sheet per batch).
			path: 'batches/:batchId/weight-sheet',
			element: <WeightControlSheetView />
		}
	]
};

export default route;

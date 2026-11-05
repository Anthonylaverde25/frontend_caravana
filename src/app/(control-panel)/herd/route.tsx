import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const HerdHubView = lazy(() => import('src/ui/herd/views/HerdHubView'));
const HerdBatchView = lazy(() => import('src/ui/herd/views/HerdBatchView'));
const BulkWeightView = lazy(() => import('../livestock/records/BulkWeightView'));
const WeightControlSheetView = lazy(() => import('../livestock/records/WeightControlSheetView'));

/**
 * Own herd: consolidated Hub with Lotes & Caravanas, Planilla de Producción, and Movement History,
 * plus batch operational screens (bulk weighing, control sheet).
 */
const route: FuseRouteItemType = {
	path: 'herd',
	children: [
		{
			index: true,
			element: <HerdHubView />
		},
		{
			path: 'movements',
			element: <Navigate to="/herd?tab=movements" replace />
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

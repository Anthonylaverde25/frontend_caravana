import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const MovementSheetView = lazy(() => import('src/ui/activities/views/MovementSheetView'));
const TransferAnimalsView = lazy(() => import('src/ui/activities/views/TransferAnimalsView'));

/**
 * The Activities page route.
 * Canonical list is now located under Hacienda Propia Hub (/herd?tab=production).
 */
const route: FuseRouteItemType[] = [
    {
        path: 'activities',
        element: <Navigate to="/herd?tab=production" replace />
    },
    {
        path: 'activities/sheet/:stageId',
        element: <MovementSheetView />
    },
    {
        // The selection of animals lives in a screen of its own, not in a dialog: it is
        // a long sweep over a list and it deserves a URL you can come back to.
        path: 'activities/batches/:batchId/transfer',
        element: <TransferAnimalsView />
    }
];

export default route;

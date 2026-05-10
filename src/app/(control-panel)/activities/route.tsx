import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ActivitiesView = lazy(() => import('src/ui/activities/views/ActivitiesView'));
const MovementSheetView = lazy(() => import('src/ui/activities/views/MovementSheetView'));

/**
 * The Activities page route.
 */
const route: FuseRouteItemType[] = [
    {
        path: 'activities',
        element: <ActivitiesView />
    },
    {
        path: 'activities/sheet/:stageId',
        element: <MovementSheetView />
    }
];

export default route;

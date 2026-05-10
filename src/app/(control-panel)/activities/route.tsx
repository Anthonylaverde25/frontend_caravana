import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ActivitiesView = lazy(() => import('src/ui/activities/views/ActivitiesView'));

/**
 * The Activities page route.
 */
const route: FuseRouteItemType = {
    path: 'activities',
    element: <ActivitiesView />
};

export default route;

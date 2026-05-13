import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const TemplatesView = lazy(() => import('@/ui/work-templates/TemplatesView'));

/**
 * The Settings page route.
 */
const route: FuseRouteItemType = {
    path: 'work-templates',
    element: <TemplatesView />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WorkTemplateScanView = lazy(() => import('@/ui/work-templates/views/WorkTemplateScanView'));

/**
 * The Work Template Scan & Document Processing route.
 */
const route: FuseRouteItemType = {
  path: 'work-templates/scan',
  element: <WorkTemplateScanView />
};

export default route;

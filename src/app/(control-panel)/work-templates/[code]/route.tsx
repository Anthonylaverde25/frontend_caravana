import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WorkTemplatePrintView = lazy(() => import('src/ui/work-templates/views/WorkTemplatePrintView'));

/**
 * Dedicated Work Template Print/PDF Page route.
 */
const route: FuseRouteItemType = {
  path: 'work-templates/:code',
  element: <WorkTemplatePrintView />
};

export default route;

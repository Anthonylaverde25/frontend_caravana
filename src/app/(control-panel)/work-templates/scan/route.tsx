import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WorkTemplateScanView = lazy(() => import('@/ui/work-templates/views/WorkTemplateScanView'));

/**
 * The Work Template Scan & Document Processing route. The optional segment names the template
 * analyzed (e.g. /work-templates/scan/cact-01): one route, so naming it does not remount the view.
 */
const route: FuseRouteItemType = {
  path: 'work-templates/scan/:code?',
  element: <WorkTemplateScanView />
};

export default route;

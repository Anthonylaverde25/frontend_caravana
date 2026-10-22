import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const CalvesHubView = lazy(() => import('src/ui/gestation/views/CalvesHubView'));

/**
 * "Crías al pie y destete", first tab: the calves still nursing. The weaning orders are its second
 * tab, at `/weaning-orders`.
 */
const route: FuseRouteItemType = {
  path: 'gestation/births',
  element: <CalvesHubView tab="at-foot" />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const PaternityView = lazy(() => import('src/ui/gestation/views/PaternityView'));

/** "Paternidad pendiente": confirm the sire of calves born without one. */
const route: FuseRouteItemType = {
  path: 'gestation/paternity',
  element: <PaternityView />
};

export default route;

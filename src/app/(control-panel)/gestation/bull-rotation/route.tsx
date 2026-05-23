import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BullRotationView = lazy(() => import('src/ui/gestation/views/BullRotationView'));

/**
 * The Bull Rotation Page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/bull-rotation',
  element: <BullRotationView />
};

export default route;

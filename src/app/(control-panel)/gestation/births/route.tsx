import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GestationBirthsView = lazy(() => import('src/ui/gestation/views/GestationBirthsView'));

/**
 * The Gestation Births Page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/births',
  element: <GestationBirthsView />
};

export default route;

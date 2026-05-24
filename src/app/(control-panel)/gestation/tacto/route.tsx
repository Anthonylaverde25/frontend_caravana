import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GestationTactoView = lazy(() => import('src/ui/gestation/views/GestationTactoView'));

/**
 * The Gestation Tacto Page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/tacto',
  element: <GestationTactoView />
};

export default route;

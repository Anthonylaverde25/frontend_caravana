import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GestationPedigreeView = lazy(() => import('src/ui/gestation/views/GestationPedigreeView'));

/**
 * The Gestation Pedigree Page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/pedigree',
  element: <GestationPedigreeView />
};

export default route;

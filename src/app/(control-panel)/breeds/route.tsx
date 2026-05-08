import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BreedsView = lazy(() => import('src/ui/breeds/views/BreedsView'));

/**
 * The Breeds page route.
 */
const route: FuseRouteItemType = {
  path: 'breeds',
  element: <BreedsView />
};

export default route;

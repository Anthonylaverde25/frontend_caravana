import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const SuppliersExampleView = lazy(() => import('src/ui/suppliers/views/SuppliersExampleView'));

/**
 * The Suppliers Example page route.
 */
const route: FuseRouteItemType = {
    path: 'suppliers/example',
    element: <SuppliersExampleView />
};

export default route;

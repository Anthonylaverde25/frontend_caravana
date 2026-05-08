import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const SuppliersView = lazy(() => import('src/ui/suppliers/views/SuppliersView'));

/**
 * The Suppliers page route.
 */
const route: FuseRouteItemType = {
    path: 'providers',
    element: <SuppliersView />
};

export default route;

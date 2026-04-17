import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const SuppliersView = lazy(() => import('@/ui/suppliers/views/SuppliersView'));

/**
 * The Suppliers page route.
 */
const route: FuseRouteItemType = {
    path: 'suppliers',
    element: <SuppliersView />
};

export default route;

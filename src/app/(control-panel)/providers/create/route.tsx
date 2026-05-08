import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const CreateSupplierView = lazy(() => import('src/ui/suppliers/views/CreateSupplierView'));

/**
 * The Create Supplier page route.
 */
const route: FuseRouteItemType = {
    path: 'suppliers/create',
    element: <CreateSupplierView />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WarehousesView = lazy(() => import('src/ui/warehouses/views/WarehousesView'));

/** The company's warehouses (delivery D): create, rename, default, deactivate, transfer. */
const route: FuseRouteItemType = {
	path: 'warehouses',
	element: <WarehousesView />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const PartnersView = lazy(() => import('src/ui/partners/views/PartnersView'));

/**
 * "Clientes y proveedores".
 */
const route: FuseRouteItemType = {
	path: 'partners',
	element: <PartnersView />
};

export default route;

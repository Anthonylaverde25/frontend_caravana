import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ItemsView = lazy(() => import('src/ui/items/views/ItemsView'));
const ItemDetailView = lazy(() => import('src/ui/items/views/ItemDetailView'));
const ItemSettingsView = lazy(() => import('src/ui/items/views/ItemSettingsView'));

/**
 * The company's catalog of articles and services, the item file (presentations and providers)
 * and the units and categories it is built on.
 */
const route: FuseRouteItemType = {
	path: 'items',
	children: [
		{ index: true, element: <ItemsView /> },
		{ path: 'settings', element: <ItemSettingsView /> },
		{ path: ':itemId', element: <ItemDetailView /> }
	]
};

export default route;

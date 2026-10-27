import { lazy } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { settingsSectionPath } from '@/ui/settings/config/settingsNavigation';
import { FEATURED_TABS } from '@/ui/items/components/header/itemTabs';

const ItemsView = lazy(() => import('src/ui/items/views/ItemsView'));
const ItemDetailView = lazy(() => import('src/ui/items/views/ItemDetailView'));

/** Units and categories moved into Settings; the old link (and its `?tab=`) still lands on them. */
function ItemSettingsRedirect() {
	const [params] = useSearchParams();

	return <Navigate replace to={settingsSectionPath(params.get('tab') === 'categories' ? 'item-categories' : 'item-units')} />;
}

/**
 * The company's catalog of articles and services and the item file (presentations and providers).
 */
const route: FuseRouteItemType = {
	path: 'items',
	children: [
		{ index: true, element: <ItemsView /> },
		// The catalog's tabs live in the URL (semen S-A, DA1); `:itemId` is numeric, so they never collide.
		...FEATURED_TABS.map((t) => ({ path: t.slug, element: <ItemsView /> })),
		{ path: 'settings', element: <ItemSettingsRedirect /> },
		{ path: ':itemId', element: <ItemDetailView /> }
	]
};

export default route;

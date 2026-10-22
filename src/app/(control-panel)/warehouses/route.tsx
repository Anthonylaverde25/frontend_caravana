import { Navigate, useSearchParams } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { settingsSectionPath } from '@/ui/settings/config/settingsNavigation';

/** The warehouses moved into Settings; the old link (and `?new=1`) still lands on them. */
function WarehousesRedirect() {
	const [params] = useSearchParams();

	return <Navigate replace to={`${settingsSectionPath('warehouses')}${params.get('new') ? '&new=1' : ''}`} />;
}

const route: FuseRouteItemType = {
	path: 'warehouses',
	element: <WarehousesRedirect />
};

export default route;

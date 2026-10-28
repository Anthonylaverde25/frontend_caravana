import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const LegacyProvidersRedirect = lazy(() => import('src/ui/partners/views/LegacyProvidersRedirect'));

/**
 * The older /suppliers paths (list and creation) moved to /partners as well.
 */
const route: FuseRouteItemType = {
	path: 'suppliers/*',
	element: <LegacyProvidersRedirect />
};

export default route;

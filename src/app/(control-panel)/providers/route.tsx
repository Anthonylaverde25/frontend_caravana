import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const LegacyProvidersRedirect = lazy(() => import('src/ui/partners/views/LegacyProvidersRedirect'));

/**
 * /providers and its subroutes moved to /partners.
 */
const route: FuseRouteItemType = {
	path: 'providers/*',
	element: <LegacyProvidersRedirect />
};

export default route;

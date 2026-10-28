import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Opens the canonical creation modal on /partners.
 */
const route: FuseRouteItemType = {
	path: 'partners/create',
	element: (
		<Navigate
			to="/partners?action=create"
			replace
		/>
	)
};

export default route;

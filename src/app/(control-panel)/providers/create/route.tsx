import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * The Create Supplier page route.
 * Redirects to /providers with action=create parameter to open the canonical creation modal.
 */
const route: FuseRouteItemType = {
	path: 'suppliers/create',
	element: <Navigate to="/providers?action=create" replace />
};

export default route;

import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Redirect to consolidated Lotes Administrativos Hub with death tab active.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/internal-death',
	element: <Navigate to="/internal-batches?tab=death" replace />
};

export default route;

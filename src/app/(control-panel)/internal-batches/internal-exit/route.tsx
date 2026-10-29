import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Redirect to consolidated Lotes Administrativos Hub with exit tab active.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/internal-exit',
	element: <Navigate to="/internal-batches?tab=exit" replace />
};

export default route;

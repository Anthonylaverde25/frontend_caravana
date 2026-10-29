import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Redirect to consolidated Lotes Administrativos Hub with consumption tab active.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/internal-consumption',
	element: <Navigate to="/internal-batches?tab=consumption" replace />
};

export default route;

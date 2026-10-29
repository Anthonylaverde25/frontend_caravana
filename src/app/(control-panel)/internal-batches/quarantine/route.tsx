import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Redirect to consolidated Lotes Administrativos Hub with quarantine tab active.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/quarantine',
	element: <Navigate to="/internal-batches?tab=quarantine" replace />
};

export default route;

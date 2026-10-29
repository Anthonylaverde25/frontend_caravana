import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Redirect to consolidated Lotes Administrativos Hub with reserve tab active.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/reserve',
	element: <Navigate to="/internal-batches?tab=reserve" replace />
};

export default route;

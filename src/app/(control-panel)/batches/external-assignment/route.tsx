import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * The External Batch Assignment page route.
 * Canonical location is now under Lotes Administrativos Hub (/internal-batches?tab=assignment).
 */
const route: FuseRouteItemType = {
  path: 'batches/external-assignment',
  element: <Navigate to="/internal-batches?tab=assignment" replace />
};

export default route;

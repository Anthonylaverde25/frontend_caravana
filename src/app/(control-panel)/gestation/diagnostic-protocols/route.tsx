import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Registry of the evidentiary documents backing every sanitary certification (Use Case 2).
 * Canonical location is under the consolidated Sanidad & Veterinaria Hub (/health?tab=protocols).
 */
const route: FuseRouteItemType = {
  path: 'gestation/diagnostic-protocols',
  element: <Navigate to="/health?tab=protocols" replace />,
};

export default route;

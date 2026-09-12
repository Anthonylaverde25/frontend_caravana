import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const DiagnosticProtocolsView = lazy(() => import('src/ui/gestation/views/DiagnosticProtocolsView'));

/**
 * Registry of the evidentiary documents backing every sanitary certification (Use Case 2).
 */
const route: FuseRouteItemType = {
  path: 'gestation/diagnostic-protocols',
  element: <DiagnosticProtocolsView />,
};

export default route;

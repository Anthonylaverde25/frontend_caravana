import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BulkTactoStartView = lazy(() => import('src/ui/gestation/views/BulkTactoStartView'));

/**
 * "Cargar tacto" of a service order: one full-screen dialog over the list with the result of each
 * female. Also the loading of the missing verdicts of "Cerrar orden" (close mode, router state).
 */
const route: FuseRouteItemType = {
  path: 'gestation/service-orders/:orderId/bulk-tacto',
  element: <BulkTactoStartView />
};

export default route;

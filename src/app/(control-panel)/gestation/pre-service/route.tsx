import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BullClinicalHistoryView = lazy(() => import('src/ui/gestation/views/BullClinicalHistoryView'));

/**
 * The Pre-Service and Bull Health Evaluation page routes.
 * Canonical location is under the consolidated Sanidad & Veterinaria Hub (/health?tab=pre-service).
 */
const routes: FuseRouteItemType[] = [
  {
    path: 'gestation/pre-service',
    element: <Navigate to="/health?tab=pre-service" replace />,
  },
  {
    path: 'gestation/pre-service/:caravanId',
    element: <BullClinicalHistoryView />,
  },
];

export default routes;

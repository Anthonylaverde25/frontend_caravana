import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const PreServiceView = lazy(() => import('src/ui/gestation/views/PreServiceView'));
const BullClinicalHistoryView = lazy(() => import('src/ui/gestation/views/BullClinicalHistoryView'));

/**
 * The Pre-Service and Bull Health Evaluation page routes.
 */
const routes: FuseRouteItemType[] = [
  {
    path: 'gestation/pre-service',
    element: <PreServiceView />,
  },
  {
    path: 'gestation/pre-service/:caravanId',
    element: <BullClinicalHistoryView />,
  },
];

export default routes;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const RegisterBirthsView = lazy(() => import('src/ui/gestation/views/RegisterBirthsView'));

/**
 * "Registrar partos" of one batch: a full-screen sheet over Monitoreo Gestacional. Registering
 * creates the birth order, already executed; there is no order to issue beforehand.
 */
const route: FuseRouteItemType = {
  path: 'gestation/list/:batchId/register-births',
  element: <RegisterBirthsView />
};

export default route;

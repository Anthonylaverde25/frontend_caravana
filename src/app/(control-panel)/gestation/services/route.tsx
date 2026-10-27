import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ServicesHubView = lazy(() => import('src/ui/gestation/views/ServicesHubView'));

/**
 * Reproductive services: work queues (conventional, insemination) and history in one view.
 *
 * Supported URLs:
 * - /gestation/services -> redirects to /gestation/services/conventional
 * - /gestation/services/conventional (Monta natural con toros, default)
 * - /gestation/services/insemination (Inseminación artificial / IATF)
 * - /gestation/services/history (Historial)
 * - /gestation/services/active, /tacto, /orders: earlier names, smoothly mapped
 */
const route: FuseRouteItemType = {
  path: 'gestation/services',
  children: [
    { index: true, element: <Navigate to="/gestation/services/conventional" replace /> },
    { path: ':tab', element: <ServicesHubView /> }
  ]
};

export default route;

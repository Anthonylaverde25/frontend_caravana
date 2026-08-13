import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GestationPedigreeView = lazy(() => import('src/ui/gestation/views/GestationPedigreeView'));
const PedigreeGraphView = lazy(() => import('src/ui/gestation/views/PedigreeGraphView'));
const CaravanPedigreeDetailView = lazy(() => import('src/ui/gestation/views/CaravanPedigreeDetailView'));

/**
 * The Gestation Pedigree Routes (List, Full Graph Explorer and Dedicated Animal Detail).
 */
const routes: FuseRouteItemType[] = [
  {
    path: 'gestation/pedigree',
    element: <GestationPedigreeView />
  },
  {
    path: 'gestation/pedigree/grafo',
    element: <PedigreeGraphView />
  },
  {
    path: 'gestation/pedigree/:caravanId',
    element: <CaravanPedigreeDetailView />
  }
];

export default routes;

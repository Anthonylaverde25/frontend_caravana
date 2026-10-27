import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const InseminationEntryView = lazy(() => import('src/ui/gestation/views/InseminationEntryView'));

/** "Cargar inseminaciones" of an AI service order (semen S-B): one full-screen sheet over the list. */
const route: FuseRouteItemType = {
  path: 'gestation/service-orders/:orderId/inseminations',
  element: <InseminationEntryView />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BulkDiagnosisEntryView = lazy(() => import('src/ui/gestation/views/BulkDiagnosisEntryView'));

/**
 * The Bulk Pregnancy Diagnosis (Tacto) Entry page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/service-orders/:orderId/bulk-tacto',
  element: <BulkDiagnosisEntryView />
};

export default route;

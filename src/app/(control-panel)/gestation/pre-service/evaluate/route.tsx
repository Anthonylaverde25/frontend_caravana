import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BullEvaluationSheetView = lazy(() => import('src/ui/gestation/views/BullEvaluationSheetView'));

/**
 * Dedicated Pre-Service Bull Evaluation Spreadsheet page route.
 */
const route: FuseRouteItemType = {
  path: 'gestation/pre-service/evaluate',
  element: <BullEvaluationSheetView />
};

export default route;

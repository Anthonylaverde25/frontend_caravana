import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const InternalConsumptionView = lazy(() => import('src/ui/internal-batches/views/InternalConsumptionView'));

/**
 * The Internal Consumption Batches page route.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches/internal-consumption',
	element: <InternalConsumptionView />
};

export default route;

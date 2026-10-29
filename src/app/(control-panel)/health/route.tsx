import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const HealthHubView = lazy(() => import('src/ui/health/views/HealthHubView'));

/**
 * Health & Veterinary Management Hub:
 * Unifies Pre-Service bull evaluations, Diagnostic Protocols, and Veterinary Portals.
 */
const route: FuseRouteItemType = {
	path: 'health',
	element: <HealthHubView />
};

export default route;

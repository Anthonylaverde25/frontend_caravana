import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WorkTemplatesHubView = lazy(() => import('@/ui/work-templates/views/WorkTemplatesHubView'));

/**
 * Plantillas & Digitalización OCR Hub:
 * Unifies AI OCR template scanning and the Zootechnical Template Gallery.
 */
const route: FuseRouteItemType = {
	path: 'work-templates',
	element: <WorkTemplatesHubView />
};

export default route;

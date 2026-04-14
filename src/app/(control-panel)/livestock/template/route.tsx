import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const TemplateView = lazy(() => import('./TemplateView'));

/**
 * The Livestock Template Generator page route.
 */
const route: FuseRouteItemType = {
	path: 'livestock/generator',
	element: <TemplateView />
};

export default route;

import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const UploadView = lazy(() => import('./UploadView'));

/**
 * The Livestock Upload page route.
 */
const route: FuseRouteItemType = {
	path: 'livestock/upload',
	element: <UploadView />
};

export default route;
